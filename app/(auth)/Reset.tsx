import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../components/APIErrorHandler";
import { ControlledPaperEmailInput } from "../../components/form";
import { useAuth } from "../../providers/SessionProvider";
import { useKyClient } from "../../services/kyClient";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "../../utils/validationSchemas";

const Reset = () => {
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);
  const { isForcePasswordReset, setIsForcePasswordReset } = useAuth();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const emailParam = Array.isArray(params.email)
    ? params.email[0] || ""
    : params.email || "";

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: emailParam,
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      const result = await client.POST("/reset-password", {
        body: { email: data.email },
      });

      return result;
    },
    onSuccess: async (response) => {
      if (response.response.status === 200) {
        router.dismissAll();
        router.replace("/(auth)/Login");
        setIsForcePasswordReset(false);
        Toast.show({
          type: "success",
          text1: "Reset password email sent",
          text2: "Check your email for the reset link",
          position: "top",
        });
      }
    },
    onError: async (error: any) => {
      setApiError(error);
    },
  });

  const onSubmit = handleSubmit((data) => {
    resetPasswordMutation.mutate(data);
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding" style={styles.formContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/bitmap.png")}
              style={styles.image}
            />
          </View>
          {isForcePasswordReset && (
            <View style={styles.forcePasswordResetContainer}>
              <Text style={styles.forcePasswordResetText}>
                Due to the database being upgraded, you need to reset your
                password.
              </Text>
            </View>
          )}
          <ControlledPaperEmailInput
            control={control}
            name="email"
            label="Email"
            style={styles.textInput}
            activeOutlineColor="black"
            textColor="black"
          />

          {resetPasswordMutation.isPending ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Button
                mode="contained"
                style={styles.sendResetButton}
                onPress={onSubmit}
                disabled={isSubmitting || resetPasswordMutation.isPending}
                loading={resetPasswordMutation.isPending}
              >
                Send Reset Email
              </Button>
              <Button
                textColor="#007AFF"
                onPress={() => router.back()}
                style={styles.button}
              >
                Back to Login
              </Button>
            </>
          )}
        </KeyboardAvoidingView>
        <APIErrorHandler error={apiError} onDismiss={() => setApiError(null)} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
  },
  textInput: {
    marginVertical: 5,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
  },
  forcePasswordResetContainer: {
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF7A7A",
    backgroundColor: "#2A1216",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  forcePasswordResetText: {
    color: "#FFDCDC",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  sendResetButton: {
    backgroundColor: "#007AFF",
    marginVertical: 10,
    borderRadius: 8,
    paddingVertical: 2,
  },
  button: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginVertical: 10,
    borderRadius: 8,
  },
});

export default Reset;
