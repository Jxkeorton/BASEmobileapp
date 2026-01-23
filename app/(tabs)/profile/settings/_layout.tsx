import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, router } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

const BackButton = React.memo(() => (
  <TouchableOpacity
    onPress={() => router.back()}
    style={{
      paddingHorizontal: 12,
      paddingVertical: 8,
    }}
  >
    <FontAwesome name="chevron-left" size={20} color="#000000" />
  </TouchableOpacity>
));

export default () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#4DB8E8",
        },
        headerTintColor: "#fff",
        headerBackTitle: "Back",
      }}
    >
      <Stack.Screen
        name="Settings"
        options={{
          title: "Settings",
          headerLeft: () => <BackButton />,
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
