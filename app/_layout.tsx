import { Slot } from "expo-router";
import { UnitSystemProvider } from "../context/UnitSystemContext";
import { PaperProvider } from "react-native-paper"; 
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryProvider } from "../providers/QueryProvider";
import { AuthProvider } from "../providers/AuthProvider";
import Toast from 'react-native-toast-message';

export default function Layout(){

    return (
        <SafeAreaProvider>
            <QueryProvider>
                <PaperProvider>
                    <UnitSystemProvider>
                        <AuthProvider>
                            <Slot/>
                            <Toast/>
                        </AuthProvider>
                    </UnitSystemProvider>
                </PaperProvider>
            </QueryProvider>
        </SafeAreaProvider>
    );
}