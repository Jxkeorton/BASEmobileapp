import { Stack } from "expo-router";

export default () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "black",
        },
        headerTintColor: "#fff",
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="LogBook"
        options={{
          title: "Logbook",
        }}
      />
      <Stack.Screen
        name="[jumpindex]"
        options={{
          title: "Jump Details",
        }}
      />
    </Stack>
  );
};
