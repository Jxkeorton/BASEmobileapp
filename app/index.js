import { 
  useRootNavigationState,
  router,
  useSegments,
} from "expo-router";
import { useUser } from "../providers/UserProvider";
import { useEffect } from "react";
import { ActivityIndicator, MD2Colors} from "react-native-paper";
import { View, StyleSheet, Text } from "react-native";

const Index = () => {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  
  const { isLoggedIn, isReady, loading, initialized, user } = useUser(); 

  // Debug logging
  useEffect(() => {
    console.log('🔍 Index Debug:', {
      isLoggedIn,
      isReady,
      initialized,
      loading,
      user: user ? { uid: user.uid, email: user.email } : null,
      segments,
      navigationReady: !!navigationState?.key
    });
  }, [isLoggedIn, isReady, initialized, loading, user, segments, navigationState?.key]);

  useEffect(() => {
    if (!navigationState?.key || !isReady) {
      console.log('⏳ Waiting for navigation or user to be ready...');
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    console.log('🚦 Navigation Decision:', { isLoggedIn, inAuthGroup, segments });

    if (!isLoggedIn && !inAuthGroup) {
      console.log('➡️ Redirecting to login');
      router.replace("/(auth)/Login");
    } else if (isLoggedIn) {
      console.log('➡️ Redirecting to tabs');
      router.replace("/(tabs)/map");
    }
  }, [segments, navigationState?.key, isLoggedIn, isReady]);

  // Show loading while initializing
  if (!navigationState?.key || !isReady || loading.auth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={MD2Colors.red800} size="large" />
        <Text style={styles.loadingText}>
          {!navigationState?.key && "Loading navigation..."}
          {!isReady && "Initializing..."}
          {loading.auth && "Checking authentication..."}
        </Text>
        <Text style={styles.debugText}>
          Navigation: {navigationState?.key ? '✅' : '❌'} | 
          Ready: {isReady ? '✅' : '❌'} | 
          Auth Loading: {loading.auth ? '🔄' : '✅'}
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