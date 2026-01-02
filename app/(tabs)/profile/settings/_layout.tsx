import { Stack, router } from "expo-router";
import { Button } from "react-native-paper";

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
        name="Settings"
        options={{
          title: "Settings",
          headerLeft: () => (
            <Button
              mode="contained-tonal"
              buttonColor="black"
              textColor="white"
              onPress={() => router.back()}
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
      <Stack.Screen
        name="PrivacyPolicy"
        options={{
          title: "Privacy Policy",
        }}
      />
      <Stack.Screen
        name="Terms"
        options={{
          title: "Terms and conditions",
        }}
      />
    </Stack>
  );
};
