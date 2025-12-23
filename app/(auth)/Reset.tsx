import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../components/APIErrorHandler";
import { useKyClient } from "../../services/kyClient";

const Reset = () => {
  const [email, setEmail] = useState("");
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const result = await client.POST("/reset-password", {
        body: { email },
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
      // Parse Ky HTTPError response body
      if (error.response) {
        try {
          const errorBody = await error.response.json();
          // Normalize error format
          if (errorBody.message && !errorBody.success) {
            setApiError({
              success: false,
              error: errorBody.message,
            });
          } else {
            setApiError(errorBody);
          }
        } catch (parseError) {
          setApiError({
            success: false,
            error: "An unexpected error occurred",
          });
        }
      } else {
        setApiError({
          success: false,
          error: error.message || "An error occurred",
        });
      }
    },
  });

  const handlePasswordReset = async () => {
    resetPasswordMutation.mutate({ email });
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
          <TextInput
            value={email}
            style={styles.textInput}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
          />

          {resetPasswordMutation.isPending ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Button
                mode="contained"
                style={styles.sendResetButton}
                onPress={handlePasswordReset}
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
        {apiError && (
          <APIErrorHandler
            error={apiError}
            onDismiss={() => setApiError(null)}
          />
        )}
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
    marginVertical: 10,
    height: 40,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
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
