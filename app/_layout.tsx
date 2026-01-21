import { Slot } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { QueryProvider } from "../providers/QueryProvider";
import { RevenueCatProvider } from "../providers/RevenueCatProvider";
import { SessionProvider } from "../providers/SessionProvider";
import { UnitSystemProvider } from "../providers/UnitSystemProvider";
import { toastConfig } from "../utils/toastConfig";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <PaperProvider>
          <UnitSystemProvider>
            <SessionProvider>
              <RevenueCatProvider>
                <Slot />
                <Toast config={toastConfig} />
              </RevenueCatProvider>
            </SessionProvider>
          </UnitSystemProvider>
        </PaperProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
