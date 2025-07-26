import { Slot } from "expo-router";
import { UnitSystemProvider } from "../context/UnitSystemContext";
import { PaperProvider } from "react-native-paper"; 
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryProvider } from "../providers/QueryProvider";
import { AuthProvider } from "../providers/AuthProvider";
import Toast from 'react-native-toast-message';

// Handles the user visiting the app to reset their password after clicking the link within their emails
const handlePasswordResetRedirect = (url) => {
    console.log('Deep link received:', url);
    
    const parsed = Linking.parse(url);
    
    // Check if it's a password reset link
    if (parsed.path === '/auth//ResetPasswordConfirm') {
        const { access_token, refresh_token } = parsed.queryParams || {};
        
        if (access_token && refresh_token) {
            router.push({
                pathname: '/(auth)//ResetPasswordConfirm',
                params: { access_token, refresh_token }
            });
        }
    }
};

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