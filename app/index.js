import { 
  useRootNavigationState,
  router,
  useSegments,
} from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { useEffect } from "react";
import { ActivityIndicator, MD2Colors} from "react-native-paper";
import { View, StyleSheet, Text } from "react-native";

const Index = () => {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  
  const { user, loading, isAuthenticated } = useAuth(); 

  useEffect(() => {
    if (!navigationState?.key) {
      console.log('⏳ Waiting for navigation to be ready...');
      return;
    }

    if (loading) {
      console.log('⏳ Waiting for auth check...');
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/Login");
    } else if (isAuthenticated) {
      router.replace("/(tabs)/map");
    }
  }, [segments, navigationState?.key, isAuthenticated, loading, user]);

  // Show loading while initializing
  if (!navigationState?.key || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={MD2Colors.red800} size="large" />
        <Text style={styles.loadingText}>
          {!navigationState?.key && "Loading navigation..."}
          {loading && "Checking authentication..."}
        </Text>
        <Text style={styles.debugText}>
          Navigation: {navigationState?.key ? '✅' : '❌'} | 
          Auth Loading: {loading ? '🔄' : '✅'} |
          User: {user?.email || 'Not logged in'}
        </Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  debugText: {
    color: '#666',
    marginTop: 10,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default Index;