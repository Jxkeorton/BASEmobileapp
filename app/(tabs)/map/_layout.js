import { Stack } from "expo-router";

export default () => {
    return (
    <Stack screenOptions={{
        headerStyle: {
          backgroundColor: 'black',
        },
        headerTintColor: '#fff',
        headerBackTitle: 'Back',
      }} >
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