import { FontAwesome } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

const SettingsButton = React.memo(() => (
  <TouchableOpacity
    onPress={() => router.navigate("/profile/settings")}
    style={{
      paddingHorizontal: 12,
      paddingVertical: 8,
    }}
  >
    <FontAwesome name="cog" size={22} color="#1a1a1a" />
  </TouchableOpacity>
));

const CancelButton = React.memo(() => (
  <TouchableOpacity
    onPress={() => router.replace("/profile/Profile")}
    style={{
      paddingHorizontal: 12,
      paddingVertical: 8,
    }}
  >
    <FontAwesome name="times" size={22} color="#1a1a1a" />
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
        name="Profile"
        options={{
          headerRight: () => <SettingsButton />,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        options={{
          title: "Edit Profile",
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
