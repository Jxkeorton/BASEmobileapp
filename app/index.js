import { 
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { AuthStore } from "../store";
import { useEffect } from "react";
import { ActivityIndicator, MD2Colors} from "react-native-paper";

const Index = () => {

  const segments = useSegments();
  const router = useRouter();

  const navigationState = useRootNavigationState();

  const { initialized, isLoggedIn } = AuthStore.useState();

  useEffect(() => {
    if (!navigationState?.key || !initialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      // redirect to login page if not logged in
      router.replace("/(auth)/Login");
    } else if (isLoggedIn) {
      // redirect to tabs page if logged in 
      router.replace("/(tabs)/map");
    }
  }, [segments, navigationState?.key, initialized]);

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
