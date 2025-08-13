import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Button } from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { useKyClient } from "../../services/kyClient";

const EmailConfirmation = () => {
  const [isResending, setIsResending] = useState(false);
  const { email } = useLocalSearchParams();
  const client = useKyClient();

  const resendConfirmation = async () => {
    if (!email) {
      Alert.alert(
        "Error",
        "Email address not found. Please try registering again."
      );
      return;
    }

    setIsResending(true);
    try {
      const response = await client.POST("/resend-confirmation", {
        body: { email: typeof email === "string" ? email : email?.[0] || "" },
      });

      if (response.response.status === 200) {
        Alert.alert(
          "Email Sent",
          "Confirmation email has been resent. Please check your inbox."
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to resend confirmation email. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Resend error:", error);

      // Handle different error responses
      if (error.response?.status === 429) {
        Alert.alert(
          "Too Many Requests",
          "Please wait before requesting another confirmation email."
        );
      } else if (error.response?.status === 400) {
        error.response
          .json()
          .then((errorData: any) => {
            Alert.alert(
              "Error",
              errorData.error || "Failed to resend confirmation email."
            );
          })
          .catch(() => {
            Alert.alert(
              "Error",
              "Failed to resend confirmation email. Please try again."
            );
          });
      } else {
        Alert.alert(
          "Error",
          "Failed to resend confirmation email. Please try again."
        );
      }
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
