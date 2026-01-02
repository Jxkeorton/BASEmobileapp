import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../components/APIErrorHandler";
import { ControlledPaperSecureTextInput } from "../components/form";
import { useKyClient } from "../services/kyClient";
import {
  type ResetPasswordConfirmFormData,
  resetPasswordConfirmSchema,
} from "../utils/validationSchemas";

const ResetPasswordConfirm = () => {
  const [apiError, setApiError] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordConfirmFormData>({
    resolver: yupResolver(resetPasswordConfirmSchema),
    mode: "onBlur",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const params = useLocalSearchParams();

  useEffect(() => {
    const parseHashParams = (url: string) => {
      // Extract hash fragment (after #)
      const hashIndex = url.indexOf("#");
      if (hashIndex === -1) return {};

      const hashFragment = url.substring(hashIndex + 1);
      const params: Record<string, string> = {};

      hashFragment.split("&").forEach((part) => {
        const [key, value] = part.split("=");
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });

      return params;
    };

    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();

      if (url) {
        const hashParams = parseHashParams(url);

        const access = hashParams.access_token;
        const refresh = hashParams.refresh_token;

        if (access) setAccessToken(access);
        if (refresh) setRefreshToken(refresh);
      }
    };

    getInitialURL();

    // Listen for URL changes when app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const hashParams = parseHashParams(url);

      const access = hashParams.access_token;
      const refresh = hashParams.refresh_token;

      if (access) setAccessToken(access);
      if (refresh) setRefreshToken(refresh);
    });

    return () => subscription.remove();
  }, []);

  const access_token: string = (params.access_token as string) || accessToken;
  const refresh_token: string =
    (params.refresh_token as string) || refreshToken;
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
      const result = await client.POST("/reset-password/confirm", {
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

  const onSubmit = handleSubmit((data) => {
    resetPasswordMutation.mutate({
      access_token: Array.isArray(access_token)
        ? access_token[0]
        : access_token,
      refresh_token: Array.isArray(refresh_token)
        ? refresh_token[0]
        : refresh_token,
      new_password: data.newPassword,
    });
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/bitmap.png")}
              style={styles.image}
            />
          </View>

          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>Enter your new password below</Text>

          <ControlledPaperSecureTextInput
            control={control}
            name="newPassword"
            label="New Password"
            style={styles.textInput}
            activeOutlineColor="black"
            textColor="black"
          />

          <ControlledPaperSecureTextInput
            control={control}
            name="confirmPassword"
            label="Confirm New Password"
            style={styles.textInput}
            activeOutlineColor="black"
            textColor="black"
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
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              Reset Password
            </Button>
          )}

          <Button
            mode="text"
            style={styles.cancelButton}
            textColor="#007AFF"
            onPress={() => router.replace("/(auth)/Login")}
          >
            Cancel
          </Button>
          <APIErrorHandler
            error={apiError}
            onDismiss={() => setApiError(null)}
          />
        </KeyboardAvoidingView>
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
    marginVertical: 5,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
  },
  resetButton: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginVertical: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default ResetPasswordConfirm;
