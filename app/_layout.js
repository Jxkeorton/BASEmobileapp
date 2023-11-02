import { Slot } from "expo-router";
import { RevenueCatProvider } from "../providers/RevenueCatProvider";
import { UnitSystemProvider } from "../context/UnitSystemContext";
import { PaperProvider } from "react-native-paper"; 
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function Layout(){
    return (
        <SafeAreaProvider>
        <PaperProvider>
            <UnitSystemProvider>
                <RevenueCatProvider>
                    <Slot/>
                </RevenueCatProvider>
            </UnitSystemProvider>
        </PaperProvider>
        </SafeAreaProvider>
    );
}
