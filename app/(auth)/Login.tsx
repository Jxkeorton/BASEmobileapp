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
  const { login, loading, setIsForcePasswordReset } = useAuth();
  const [apiError, setApiError] = useState<any>(null);

  const {
    control,
    getValues,
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

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        throw new Error("Missing sign-in response data");
      }

      return result.data;
    },
    onSuccess: async (response) => {
      const rawData = response.data as any;
      const payload = rawData?.data ?? rawData;
      const user = payload?.user;
      const session = payload?.session;

      if (
        user?.id &&
        user.email &&
        session?.access_token &&
        session?.refresh_token
      ) {
        await login({
          user: { id: user.id, email: user.email },
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });

        // Navigate to main app
        router.replace("/(tabs)/map");
        return;
      }

      setApiError({ message: "Missing session in sign-in response" });
    },
    onError: async (error: any) => {
      let parsedError = error;

      if (error?.response && typeof error.response.clone === "function") {
        try {
          parsedError = await error.response.clone().json();
        } catch {
          parsedError = error;
        }
      }

      const forcePasswordReset = parsedError?.force_password_reset === true;

      if (forcePasswordReset) {
        setIsForcePasswordReset(true);
        navigateToReset();
      } else {
        setApiError(parsedError);
      }
    },
  });

  const onSubmit = handleSubmit((data) => {
    signInMutation.mutate(data);
  });

  const getEmailValue = () => getValues("email")?.trim() || "";

  const navigateToRegister = () => {
    const email = getEmailValue();
    if (email) {
      router.push({ pathname: "Register", params: { email } });
      return;
    }

    router.push("Register");
  };

  const navigateToReset = () => {
    const email = getEmailValue();
    if (email) {
      router.push({ pathname: "Reset", params: { email } });
      return;
    }

    router.push("Reset");
  };

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
                  disabled={isSubmitting || signInMutation.isPending}
                  style={styles.loginButton}
                  loading={signInMutation.isPending}
                >
                  Login
                </Button>
                <Button
                  textColor="#007AFF"
                  onPress={navigateToRegister}
                  style={styles.button}
                >
                  Sign Up here!
                </Button>
                <Button
                  textColor="#007AFF"
                  onPress={navigateToReset}
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
                router.push("/AuthPrivacyPolicy");
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
