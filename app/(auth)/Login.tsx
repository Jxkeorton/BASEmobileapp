import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, Button, Snackbar } from "react-native-paper";
import APIErrorHandler from "../../components/APIErrorHandler";
import { useAuth } from "../../providers/AuthProvider";
import { useKyClient } from "../../services/kyClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { updateUser, loading } = useAuth();

  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return client.POST("/signin", {
        body: { email, password },
      });
    },
    onSuccess: async (response) => {
      const user = response.data?.data?.user;

      if (response.response.status === 200) {
        // Store token and user data using simple storage
        await AsyncStorage.setItem(
          "auth_token",
          response.data?.data?.session?.access_token || ""
        );
        await AsyncStorage.setItem(
          "refresh_token",
          response.data?.data?.session?.refresh_token || ""
        );

        if (user != undefined && user.id && user.email) {
          updateUser({ id: user.id, email: user.email });
        }

        // Navigate to main app
        router.replace("/(tabs)/map");
      } else {
        setValidationError(
          response.error || "Invalid email or password. Please try again."
        );
      }
    },
    onError: async (error: any) => {
      setApiError(error);
    },
  });

  const handleSignIn = async () => {
    if (!email || !password) {
      setValidationError("Email and password are required.");
      return;
    }

    signInMutation.mutate({ email, password });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/bitmap.png")}
            style={styles.image}
          />
        </View>
        <KeyboardAvoidingView behavior="padding">
          <TextInput
            value={email}
            style={styles.textInput}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text.trim())}
          />
          <TextInput
            secureTextEntry={true}
            value={password}
            style={styles.textInput}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}
          />

          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Button
                mode="contained"
                style={styles.loginButton}
                onPress={handleSignIn}
              >
                Login
              </Button>
              <Button
                textColor="#007AFF"
                onPress={() => router.replace("Register")}
                style={styles.button}
              >
                Sign Up here!
              </Button>
              <Button
                textColor="#007AFF"
                onPress={() => router.replace("Reset")}
                style={styles.button}
              >
                Forgot Password
              </Button>
            </>
          )}
          <Button
            textColor="#007AFF"
            style={styles.privacyPolicyLink}
            onPress={() => {
              router.navigate("/AuthPrivacyPolicy");
            }}
          >
            Privacy Policy
          </Button>
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
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
  },
  loginButton: {
    backgroundColor: "#007AFF",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginVertical: 10,
  },
  privacyPolicyLink: {
    textAlign: "center",
    color: "#00ABF0",
    textDecorationLine: "underline",
    marginTop: 20,
  },
});

export default Login;
