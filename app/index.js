import { 
  useRootNavigationState,
  router,
  useSegments,
} from "expo-router";
import { useUser } from "../providers/UserProvider";
import { useEffect } from "react";
import { ActivityIndicator, MD2Colors} from "react-native-paper";
import { View, StyleSheet } from "react-native";

const Index = () => {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  
  const { isLoggedIn, isReady, loading } = useUser(); 

  useEffect(() => {
    if (!navigationState?.key || !isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      // redirect to login page if not logged in
      router.replace("/(auth)/Login");
    } else if (isLoggedIn) {
      // redirect to tabs page if logged in 
      router.replace("/(tabs)/map");
    }
  }, [segments, navigationState?.key, isLoggedIn, isReady]);

  // Show loading while initializing
  if (!navigationState?.key || !isReady || loading.auth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={MD2Colors.red800} size="large" />
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
});

export default Index;