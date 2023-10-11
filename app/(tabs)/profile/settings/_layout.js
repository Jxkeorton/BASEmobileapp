import { Stack, router} from "expo-router";
import { Button } from "react-native-paper";

export default () => {
    return (
    <Stack >
        <Stack.Screen
            name="Settings"
            options={{
                title: "Settings",
                headerLeft: () => (
                    <Button
                      mode="contained-tonal"
                      buttonColor="white"
                      onPress={() => router.replace('/profile/Profile')}
                    >
                      Back
                    </Button>
                ),
            }}
        />
        <Stack.Screen
            name="Contact"
            options={{
                title: "Contact Us",
            }}
        />
        <Stack.Screen
            name="DeleteAccount"
            options={{
                title: "Delete Account",
            }}
        />
    </Stack>
    )
};