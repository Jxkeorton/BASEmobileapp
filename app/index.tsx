import { Redirect } from "expo-router";
import { useAuth } from "../providers/SessionProvider";

/**
 * Index route - redirects based on authentication state.
 * The actual auth protection is handled by Stack.Protected in _layout.tsx
 */
const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  // While loading, the SplashScreenController keeps splash visible
  if (loading) {
    return null;
  }

  // Redirect to appropriate route based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/map" />;
  }

  return <Redirect href="/(auth)/Login" />;
};

export default Index;
