import { Slot } from "expo-router";
import { RevenueCatProvider } from "../providers/RevenueCatProvider";
import { UnitSystemProvider } from "../context/UnitSystemContext";
import { PaperProvider } from "react-native-paper"; 

export default function Layout(){
    return (
        <PaperProvider>
            <UnitSystemProvider>
                <RevenueCatProvider>
                    <Slot/>
                </RevenueCatProvider>
            </UnitSystemProvider>
        </PaperProvider>
    );
}
