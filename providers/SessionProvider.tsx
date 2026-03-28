import {
  createContext,
  PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setStorageItemAsync, useStorageState } from "../hooks/useStorageState";
import {
  isTokenExpired,
  refreshAuthToken,
  signOut as signOutUtil,
} from "../utils/authUtils";

export interface SessionUser {
  id: string;
  email?: string;
  [key: string]: any;
}

export interface LoginParams {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
}

export interface SessionContextType {
  user: SessionUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  login: (params: LoginParams) => Promise<void>;
  isAuthenticated: boolean;
  setIsForcePasswordReset: (value: boolean) => void;
  isForcePasswordReset: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useAuth = (): SessionContextType => {
  const context = use(SessionContext);
  if (!context) {
    throw new Error("useAuth must be used within SessionProvider");
  }
  return context;
};

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [[isLoadingToken, authToken], setAuthToken] =
    useStorageState("auth_token");
  const [[isLoadingRefresh], setRefreshToken] =
    useStorageState("refresh_token");
  const [[isLoadingUser, userData], setUserData] = useStorageState("user_data");

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isForcePasswordReset, setIsForcePasswordReset] = useState(false);

  // Parse user data from storage
  const user = useMemo((): SessionUser | null => {
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }, [userData]);

  const loading =
    isLoadingToken || isLoadingRefresh || isLoadingUser || isRefreshing;

  const login = useCallback(
    ({
      user: newUser,
      accessToken,
      refreshToken: newRefreshToken,
    }: LoginParams): Promise<void> => {
      // Persist auth payload first so immediate post-login requests read a token.
      const serializedUser = JSON.stringify(newUser);

      return Promise.all([
        setStorageItemAsync("auth_token", accessToken),
        setStorageItemAsync("refresh_token", newRefreshToken),
        setStorageItemAsync("user_data", serializedUser),
      ]).then(() => {
        setAuthToken(accessToken);
        setRefreshToken(newRefreshToken);
        setUserData(serializedUser);
      });
    },
    [setAuthToken, setRefreshToken, setUserData],
  );

  const signOut = useCallback(async (): Promise<void> => {
    await signOutUtil();
    setAuthToken(null);
    setRefreshToken(null);
    setUserData(null);
  }, [setAuthToken, setRefreshToken, setUserData]);

  /**
   * Handle token refresh on initial load if needed
   */
  useEffect(() => {
    const handleTokenRefresh = async () => {
      if (isLoadingToken || isLoadingRefresh || isLoadingUser) return;

      if (!authToken) return;

      if (isTokenExpired(authToken)) {
        setIsRefreshing(true);
        try {
          const newToken = await refreshAuthToken();

          if (newToken) {
            setAuthToken(newToken);
          } else {
            await signOut();
          }
        } catch {
          await signOut();
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    handleTokenRefresh();
  }, [
    authToken,
    isLoadingToken,
    isLoadingRefresh,
    isLoadingUser,
    signOut,
    setAuthToken,
  ]);

  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        signOut,
        login,
        isAuthenticated: !!user && !!authToken,
        setIsForcePasswordReset,
        isForcePasswordReset,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
