import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../components/APIErrorHandler";
import { useKyClient } from "../../services/kyClient";

const EmailConfirmation = () => {
  const { email } = useLocalSearchParams();
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const resendConfirmationMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const result = await client.POST("/resend-confirmation", {
        body: { email },
      });

      return result;
    },
    onSuccess: async (response) => {
      if (response.response.status === 200) {
        setCountdown(60);
        Toast.show({
          type: "success",
          text1: "Email Sent",
          text2: "Confirmation email has been resent. Please check your inbox.",
        });
      }
    },
    onError: async (error: any) => {
      setApiError(error);
    },
  });

  const resendConfirmation = async () => {
    const emailString = typeof email === "string" ? email : email?.[0] || "";
    resendConfirmationMutation.mutate({ email: emailString });
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
        loading={resendConfirmationMutation.isPending}
        style={styles.resendButton}
        disabled={!email || countdown > 0}
      >
        {countdown > 0
          ? `Resend in ${countdown}s`
          : "Resend Confirmation Email"}
      </Button>

      <Button
        mode="text"
        onPress={() => router.replace("/(auth)/Login")}
        style={styles.backButton}
        textColor="#007AFF"
      >
        Back to Login
      </Button>
      <APIErrorHandler error={apiError} onDismiss={() => setApiError(null)} />
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
  resendButton: {
    backgroundColor: "#007AFF",
    marginVertical: 10,
  },
  backButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginVertical: 10,
  },
});

export default EmailConfirmation;
