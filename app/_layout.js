import { Slot } from "expo-router";
import { RevenueCatProvider } from "../providers/RevenueCatProvider";
import { PaperProvider } from "react-native-paper"; 

export default function Layout(){
    return (
        <PaperProvider>
            <RevenueCatProvider>
                <Slot/>
            </RevenueCatProvider>
        </PaperProvider>
    );
}
