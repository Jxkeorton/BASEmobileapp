import { Stack } from "expo-router";

export default () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4DB8E8",
        },
        headerTintColor: "#fff",
        headerBackTitle: "",
      }}
    >
      <Stack.Screen
        name="Map"
        options={{
          title: "Map",
          headerShown: false,
        }}
      />
      <Stack.Screen name="[id]" options={{ title: "Location" }} />
    </Stack>
  );
};
