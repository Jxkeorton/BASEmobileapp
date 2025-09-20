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
import {
  ActivityIndicator,
  Button,
  Snackbar,
  TextInput,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../components/APIErrorHandler";
import { useKyClient } from "../../services/kyClient";

const Reset = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resetPasswordPost = async (email: string) => {
    try {
      const response = await client
        .POST("/reset-password", {
          body: { email },
        })
        .then((res) => {
          return res;
        });

      if (response.response.status === 200) {
        return { success: true };
      }
    } catch (error: any) {
      setApiError(error);
    }
  };

  const handlePasswordReset = async () => {
    // Validation
    if (!email) {
      setValidationError("Email is required.");
      return;
    }

    if (!email.includes("@")) {
      setValidationError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    const resp = await resetPasswordPost(email);
    setLoading(false);

    if (resp?.success === true) {
      router.replace("/(auth)/Login");
      Toast.show({
        type: "success",
        text1: "Reset password email sent",
        text2: "Check your email for the reset link",
        position: "top",
      });
    } else {
      setApiError(new Error("Failed to send reset email"));
    }
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

          {loading ? (
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
        {validationError && (
          <Snackbar
            visible={!!validationError}
            onDismiss={() => setValidationError(null)}
            duration={4000}
            style={{ backgroundColor: "#d32f2f" }}
          >
            {validationError}
          </Snackbar>
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
