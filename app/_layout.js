import { Slot } from "expo-router";
import { UnitSystemProvider } from "../context/UnitSystemContext";
import { PaperProvider } from "react-native-paper"; 
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { UserProvider } from "../providers/UserProvider";
import Toast from 'react-native-toast-message';

export default function Layout(){
    return (
        <SafeAreaProvider>
            <PaperProvider>
                <UnitSystemProvider>
                        <UserProvider>
                            <Slot/>
                            <Toast/>
                        </UserProvider>
                </UnitSystemProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
