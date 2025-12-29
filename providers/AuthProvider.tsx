import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const userData = await AsyncStorage.getItem("user_data");
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("user_data");
    setUser(null);
  };

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
