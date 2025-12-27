import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text, TextInput } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../components/APIErrorHandler";
import { useKyClient } from "../../services/kyClient";

const ResetPasswordConfirm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiError, setApiError] = useState<any>(null);

  const params = useLocalSearchParams();
  const access_token: string = params.access_token as string;
  const refresh_token: string = params.refresh_token as string;
  const client = useKyClient();

  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      access_token,
      refresh_token,
      new_password,
    }: {
      access_token: string;
      refresh_token: string;
      new_password: string;
    }) => {
      const result = await client.POST("/reset-password-confirm", {
        body: {
          access_token,
          refresh_token,
          new_password,
        },
      });

      return result;
    },
    onSuccess: async (response) => {
      if (response.response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Password Reset Successful",
          text2: "You can now log in with your new password",
          position: "top",
        });

        router.replace("/(auth)/Login");
      }
    },
    onError: async (error: any) => {
      setApiError(error);
    },
  });

  const handlePasswordReset = async () => {
    resetPasswordMutation.mutate({
      access_token: Array.isArray(access_token)
        ? access_token[0]
        : access_token,
      refresh_token: Array.isArray(refresh_token)
        ? refresh_token[0]
        : refresh_token,
      new_password: newPassword,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/bitmap.png")}
              style={styles.image}
            />
          </View>

          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>Enter your new password below</Text>

          <TextInput
            value={newPassword}
            style={styles.textInput}
            placeholder="New Password"
            secureTextEntry={true}
            autoCapitalize="none"
            onChangeText={(text) => setNewPassword(text)}
          />

          <TextInput
            value={confirmPassword}
            style={styles.textInput}
            placeholder="Confirm New Password"
            secureTextEntry={true}
            autoCapitalize="none"
            onChangeText={(text) => setConfirmPassword(text)}
          />

          {resetPasswordMutation.isPending ? (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={styles.loader}
            />
          ) : (
            <Button
              mode="contained"
              style={styles.resetButton}
              onPress={handlePasswordReset}
            >
              Reset Password
            </Button>
          )}

          <Button
            mode="text"
            style={styles.cancelButton}
            onPress={() => router.replace("/(auth)/Login")}
          >
            Cancel
          </Button>
        </KeyboardAvoidingView>
        <APIErrorHandler error={apiError} onDismiss={() => setApiError(null)} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 30,
  },
  textInput: {
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  resetButton: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default ResetPasswordConfirm;
