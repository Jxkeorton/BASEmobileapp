import { Stack, router } from "expo-router";
import { Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";

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
        name="Profile"
        options={{
          headerRight: () => (
            <Button
              mode="contained-tonal"
              buttonColor="black"
              onPress={() => router.navigate("/profile/settings")}
            >
              <Icon name="cog" size={20} color="#fff" />
            </Button>
          ),
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        options={{
          title: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="SubmitLocation"
        options={{
          title: "Submit A New Exit",
          headerLeft: () => (
            <Button
              mode="contained-tonal"
              buttonColor="black"
              textColor="white"
              onPress={() => router.replace("/profile/Profile")}
            >
              Cancel
            </Button>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
        }}
      ></Stack.Screen>
    </Stack>
  );
};
