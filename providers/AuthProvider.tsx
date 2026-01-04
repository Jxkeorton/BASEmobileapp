import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  isTokenExpired,
  refreshAuthToken,
  signOut as signOurSupabase,
} from "../utils/authUtils";

// Define a type for the user object. You can expand this as needed.
export interface AuthUser {
  id: string;
  email?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateUser: (userData: AuthUser) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const signOut = useCallback(async (): Promise<void> => {
    await signOurSupabase();
    setUser(null);
  }, []);

  /**
   * Refresh the authentication token using the shared refresh utility
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await refreshAuthToken();

      if (newToken) {
        return true;
      }

      // Refresh failed, clear user state
      setUser(null);
      return false;
    } catch (error) {
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");
        const userData = await AsyncStorage.getItem("user_data");

        if (token && userData) {
          if (isTokenExpired(token)) {
            const refreshed = await refreshToken();

            if (refreshed) {
              // Keep user logged in with new token
              setUser(JSON.parse(userData));
            } else {
              await signOut();
            }
          } else {
            // Token still valid
            setUser(JSON.parse(userData));
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [refreshToken, signOut]);

  const updateUser = (userData: AuthUser): void => {
    setUser(userData);
    AsyncStorage.setItem("user_data", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
