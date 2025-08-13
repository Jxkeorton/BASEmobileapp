import React from "react";
import { Stack } from "expo-router";

const PublicLayout = () => {
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
        name="Login"
        options={{
          headerTitle: "Login",
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="Register"
        options={{
          headerTitle: "Create Account",
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="Reset"
        options={{
          headerTitle: "Reset Password",
        }}
      ></Stack.Screen>
      <Stack.Screen
        name="AuthTerms"
        options={{
          headerTitle: "Terms and Conditions",
        }}
      />
      <Stack.Screen
        name="AuthPrivacyPolicy"
        options={{
          headerTitle: "Privacy Policy",
        }}
      />
    </Stack>
  );
};

export default PublicLayout;
