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
import APIErrorHandler from "../../components/APIErrorHandler";
import {
  ControlledPaperEmailInput,
  ControlledPaperSecureTextInput,
} from "../../components/form";
import { useAuth } from "../../providers/SessionProvider";
import { useKyClient } from "../../services/kyClient";
import { type LoginFormData, loginSchema } from "../../utils/validationSchemas";

export default function Login() {
  const client = useKyClient();
  const { login, loading } = useAuth();
  const [apiError, setApiError] = useState<any>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const result = await client.POST("/signin", {
        body: { email: data.email, password: data.password },
      });

      return result;
    },
    onSuccess: async (response) => {
      const user = response.data?.data?.user;
      const session = response.data?.data?.session;

      if (
        user?.id &&
        user.email &&
        session?.access_token &&
        session?.refresh_token
      ) {
        login({
          user: { id: user.id, email: user.email },
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });
      }

      // Navigate to main app
      router.replace("/(tabs)/map");
    },
    onError: async (error: any) => {
      setApiError(error);
    },
  });

  const onSubmit = handleSubmit((data) => {
    signInMutation.mutate(data);
  });

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <APIErrorHandler
            error={apiError}
            onDismiss={() => setApiError(null)}
          />
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/bitmap.png")}
              style={styles.image}
            />
          </View>
          <KeyboardAvoidingView behavior="padding">
            <ControlledPaperEmailInput
              control={control}
              name="email"
              label="Email"
              style={styles.textInput}
              activeOutlineColor="black"
              textColor="black"
            />

            <ControlledPaperSecureTextInput
              control={control}
              name="password"
              label="Password"
              style={styles.textInput}
              activeOutlineColor="black"
              textColor="black"
            />

            {loading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <Button
                  mode="contained"
                  onPress={onSubmit}
                  disabled={isSubmitting}
                  style={styles.loginButton}
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
        </View>
      </TouchableWithoutFeedback>
    </>
  );
}

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
