import {
  createContext,
  PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useStorageState } from "../hooks/useStorageState";
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
  login: (params: LoginParams) => void;
  isAuthenticated: boolean;
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
  const [[isLoadingRefresh, refreshToken], setRefreshToken] =
    useStorageState("refresh_token");
  const [[isLoadingUser, userData], setUserData] = useStorageState("user_data");

  const [isRefreshing, setIsRefreshing] = useState(false);

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
    }: LoginParams): void => {
      setAuthToken(accessToken);
      setRefreshToken(newRefreshToken);
      setUserData(JSON.stringify(newUser));
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
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
