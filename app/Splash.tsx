import { SplashScreen } from "expo-router";
import { useAuth } from "../providers/SessionProvider";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { loading } = useAuth();

  if (!loading) {
    SplashScreen.hide();
  }

  return null;
}
