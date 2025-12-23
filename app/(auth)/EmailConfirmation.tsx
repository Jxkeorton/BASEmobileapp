import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Snackbar } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../components/APIErrorHandler";
import { useKyClient } from "../../services/kyClient";

const EmailConfirmation = () => {
  const [isResending, setIsResending] = useState(false);
  const { email } = useLocalSearchParams();
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const resendConfirmation = async () => {
    if (!email) {
      setValidationError("Email is required.");
      return;
    }

    setIsResending(true);
    try {
      const response = await client.POST("/resend-confirmation", {
        body: { email: typeof email === "string" ? email : email?.[0] || "" },
      });

      if (response.response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Email Sent",
          text2: "Confirmation email has been resent. Please check your inbox.",
        });
      } else {
        setValidationError(
          "Failed to resend confirmation email. Please try again."
        );
      }
    } catch (error: any) {
      setApiError(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Your Email</Text>
      {email && (
        <Text style={styles.emailText}>
          We sent a confirmation email to {email}
        </Text>
      )}
      <Text style={styles.message}>
        Please click the link in the email to activate your account.
      </Text>

      <Button
        mode="contained"
        onPress={resendConfirmation}
        loading={isResending}
        style={styles.button}
        disabled={!email}
      >
        Resend Confirmation Email
      </Button>

      <Button
        mode="text"
        onPress={() => router.replace("/(auth)/Login")}
        style={styles.button}
      >
        Back to Login
      </Button>
      {apiError && (
        <APIErrorHandler error={apiError} onDismiss={() => setApiError(null)} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "white",
  },
  emailText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#00ABF0",
    fontWeight: "500",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
    color: "white",
  },
  button: {
    marginVertical: 10,
  },
});

export default EmailConfirmation;
