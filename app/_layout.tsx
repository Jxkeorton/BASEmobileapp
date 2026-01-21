import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { QueryProvider } from "../providers/QueryProvider";
import { RevenueCatProvider } from "../providers/RevenueCatProvider";
import { SessionProvider, useAuth } from "../providers/SessionProvider";
import { UnitSystemProvider } from "../providers/UnitSystemProvider";
import { toastConfig } from "../utils/toastConfig";
import { SplashScreenController } from "./Splash";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <PaperProvider>
          <UnitSystemProvider>
            <SessionProvider>
              <RevenueCatProvider>
                <SplashScreenController />
                <RootNavigator />
                <Toast config={toastConfig} />
              </RevenueCatProvider>
            </SessionProvider>
          </UnitSystemProvider>
        </PaperProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Protected routes - only accessible when authenticated */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="PayWall" options={{ presentation: "modal" }} />
      </Stack.Protected>

      {/* Public routes - only accessible when NOT authenticated */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Always accessible routes */}
      <Stack.Screen name="reset-password-confirm" />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
