import { Stack, useRouter } from "expo-router";
import { Button } from "react-native-paper";
import { appSignOut } from "../../../store";

const router = useRouter()

export default () => {
    return (
    <Stack >
        <Stack.Screen
            name="Profile"
            options={{
                headerRight: () => (
                    <Button mode='contained-tonal' buttonColor="white" onPress={() => appSignOut()} title="LogOut" >Logout</Button>
                ),
                headerTitle: "",
            }}
        />
        <Stack.Screen
            name="EditProfile"
            options={{
                title: "Edit Profile",
                headerLeft: () => (
                    <Button
                      mode="contained-tonal"
                      buttonColor="white"
                      onPress={() => router.replace('/profile/Profile')}
                    >
                      Cancel
                    </Button>
                ),
            }}
        />
    </Stack>
    )
};