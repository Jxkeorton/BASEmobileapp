import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import ky from "ky";
import { Platform } from "react-native";
import { setStorageItemAsync } from "../hooks/useStorageState";

/**
 * Helper to get item from secure storage (SecureStore on native, localStorage on web)
 */
const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
};

const getBaseUrl = () => {
  if (__DEV__) {
    return (
      process.env.EXPO_PUBLIC_API_DEV_BASE_URL ||
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      ""
    );
  }
  return process.env.EXPO_PUBLIC_API_BASE_URL || "";
};

export const signOut = async (): Promise<void> => {
  try {
    const authToken = await getStorageItem("auth_token");
    const baseUrl = getBaseUrl();

    if (authToken && baseUrl) {
      await ky.post(`${baseUrl}/signout`, {
        headers: {
          "x-api-key": process.env.EXPO_PUBLIC_API_KEY,
          Authorization: `Bearer ${authToken}`,
        },
      });
    }
  } catch (error) {
    // Silently continue with local cleanup
  } finally {
    // Always clear secure storage regardless of API call result
    await setStorageItemAsync("auth_token", null);
    await setStorageItemAsync("refresh_token", null);
    await setStorageItemAsync("user_data", null);
    router.replace("/(auth)/Login");
  }
};

/**
 * Shared token refresh logic used by both SessionProvider and kyClient
 * Calls the /refresh API endpoint and stores new tokens
 */
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getStorageItem("refresh_token");

    if (!refreshToken) {
      return null;
    }

    const baseUrl = getBaseUrl();
    const response = await ky
      .post(`${baseUrl}/refresh`, {
        json: { refresh_token: refreshToken },
        headers: {
          "x-api-key": process.env.EXPO_PUBLIC_API_KEY,
        },
      })
      .json<{
        success: boolean;
        data: {
          session: {
            access_token: string;
            refresh_token: string;
            expires_at: number;
          };
        };
      }>();

    if (response.success && response.data.session) {
      const { access_token, refresh_token } = response.data.session;

      // Store new tokens securely
      await setStorageItemAsync("auth_token", access_token);
      await setStorageItemAsync("refresh_token", refresh_token);

      return access_token;
    }

    return null;
  } catch (error) {
    // Clear stored tokens on refresh failure
    await setStorageItemAsync("auth_token", null);
    await setStorageItemAsync("refresh_token", null);
    await setStorageItemAsync("user_data", null);
    return null;
  }
};

/**
 * Decode JWT to check expiration (without verification)
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const tokenPart = token.split(".")[1];
    if (!tokenPart) {
      throw new Error("Invalid token format");
    }
    const payload = JSON.parse(atob(tokenPart));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    // Return true if expired or expiring within 5 minutes
    return expirationTime - currentTime < fiveMinutes;
  } catch (error) {
    return true; // Treat invalid tokens as expired
  }
};
