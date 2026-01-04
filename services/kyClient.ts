import AsyncStorage from "@react-native-async-storage/async-storage";
import ky from "ky";
import createClient from "openapi-fetch";
import { paths } from "../types/api";
import { refreshAuthToken, signOut } from "../utils/authUtils";

const getBaseUrl = () => {
  if (__DEV__) {
    const devUrl =
      process.env.EXPO_PUBLIC_API_DEV_BASE_URL ||
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "";
    return devUrl;
  }

  const prodBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  return prodBaseURL;
};

let baseUrl = getBaseUrl();

export const kyInstance = (timeout: number) =>
  ky.create({
    headers: {
      "x-api-key": process.env.EXPO_PUBLIC_API_KEY,
    },
    timeout: timeout,
    retry: {
      limit: 2,
      methods: ["get"],
      statusCodes: [408, 413, 429, 500, 502, 503, 504], // Don't retry 401
    },
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await AsyncStorage.getItem("auth_token");

          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }

          const method = request.method.toLowerCase();
          const hasBody = request.body !== null && request.body !== undefined;

          if (hasBody && !request.headers.get("Content-Type")) {
            request.headers.set("Content-Type", "application/json");
          }

          if (method === "get") {
            request.headers.delete("Content-Type");
          }
        },
      ],
      afterResponse: [
        async (request, _options, response) => {
          // Handle 401 (unauthorized) - token expired
          if (response.status === 401) {
            const newToken = await refreshAuthToken();

            if (newToken) {
              request.headers.set("Authorization", `Bearer ${newToken}`);
              return ky(request);
            } else {
              await signOut();
            }
          }

          return response;
        },
      ],
    },
  });

export const useKyClient = () => {
  return createClient<paths>({
    baseUrl,
    fetch: kyInstance(30000),
  });
};
