import { 
  useRootNavigationState,
  router,
  useSegments,
} from "expo-router";
import { AuthStore } from "../store";
import { useEffect } from "react";
import { ActivityIndicator, MD2Colors} from "react-native-paper";
import { DEV_BYPASS_LOGIN } from "../store";

const Index = () => {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { initialized, isLoggedIn, user } = AuthStore.useState();

  console.log('📱 Index render:', {
    segments: segments.join('/'),
    initialized,
    isLoggedIn,
    user: user?.email || 'No user',
    navigationKey: navigationState?.key
  });

  useEffect(() => {
    if (!navigationState?.key || !initialized) return;
  
    console.log('Navigation check:', { isLoggedIn, segments: segments.join('/') || 'ROOT' });
  
    // If logged in and on root page, go to main app
    if (isLoggedIn && segments.length === 0) {
      console.log('🔄 Going to map');
      router.replace("/(tabs)/map");
      return;
    }
  
    // If not logged in and not in auth, go to login
    const inAuthGroup = segments[0] === "(auth)";
    if (!isLoggedIn && !inAuthGroup) {
      console.log('🔄 Going to login');
      router.replace("/(auth)/Login");
    }
  }, [segments, navigationState?.key, initialized, isLoggedIn]);
  
  return (
      <>
          {!navigationState?.key ? <ActivityIndicator animating={true} color={MD2Colors.red800}/> 
          :
          <></>
          }
      </> 
  )
};

export default Index;
