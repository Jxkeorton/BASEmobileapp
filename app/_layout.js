import { Slot } from "expo-router";
import { UnitSystemProvider } from "../context/UnitSystemContext";
import { PaperProvider } from "react-native-paper"; 
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryProvider } from "../providers/QueryProvider";
import { AuthProvider } from "../providers/AuthProvider";
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import { initializeDeepLinks } from '../utils/deepLinks';

export default function Layout(){
    useEffect(() => {
        const cleanup = initializeDeepLinks(); // When user visits from an external URL
        
        return cleanup;
    }, []);

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