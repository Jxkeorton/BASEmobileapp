import { Slot } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ErrorToast, SuccessToast } from "../components/toast/ToastComponents";
import { AuthProvider } from "../providers/AuthProvider";
import { QueryProvider } from "../providers/QueryProvider";
import { RevenueCatProvider } from "../providers/RevenueCatProvider";
import { UnitSystemProvider } from "../providers/UnitSystemProvider";

export const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <ErrorToast {...props} />,
};

export default function Layout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <PaperProvider>
          <UnitSystemProvider>
            <AuthProvider>
              <RevenueCatProvider>
                <Slot />
                <Toast config={toastConfig} />
              </RevenueCatProvider>
            </AuthProvider>
          </UnitSystemProvider>
        </PaperProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
