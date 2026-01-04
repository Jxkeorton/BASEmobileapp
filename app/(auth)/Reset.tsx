import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../components/APIErrorHandler";
import { ControlledPaperEmailInput } from "../../components/form";
import { useKyClient } from "../../services/kyClient";
import {
  type ResetPasswordFormData,
  resetPasswordSchema,
} from "../../utils/validationSchemas";

const Reset = () => {
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
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
        router.replace("/(auth)/Login");
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
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/bitmap.png")}
              style={styles.image}
            />
          </View>

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
                disabled={isSubmitting}
              >
                Send Reset Email
              </Button>
              <Button
                textColor="#007AFF"
                onPress={() => router.replace("/(auth)/Login")}
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
  sendResetButton: {
    backgroundColor: "#007AFF",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginVertical: 10,
  },
});

export default Reset;
