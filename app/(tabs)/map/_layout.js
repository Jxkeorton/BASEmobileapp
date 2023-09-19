import { Stack } from "expo-router";

export default () => {
    return (
    <Stack >
        <Stack.Screen
            name="Map"
            options={{
                title: "Map",
                headerShown: false,
            }}
        />
        <Stack.Screen
            name="[id]"
            options={{title: "Location"}}
        />
    </Stack>
    )
};