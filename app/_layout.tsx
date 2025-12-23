import { Slot } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { UnitSystemProvider } from "../context/UnitSystemContext";
import { AuthProvider } from "../providers/AuthProvider";
import { QueryProvider } from "../providers/QueryProvider";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <PaperProvider>
          <UnitSystemProvider>
            <AuthProvider>
              <Slot />
              <Toast />
            </AuthProvider>
          </UnitSystemProvider>
        </PaperProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
