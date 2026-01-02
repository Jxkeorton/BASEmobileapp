import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Button } from "react-native-paper";
import APIErrorHandler from "../../components/APIErrorHandler";
import {
  ControlledCheckbox,
  ControlledPaperEmailInput,
  ControlledPaperSecureTextInput,
  ControlledPaperTextInput,
} from "../../components/form";
import { useAuth } from "../../providers/AuthProvider";
import { useKyClient } from "../../services/kyClient";
import {
  type RegisterFormData,
  registerSchema,
} from "../../utils/validationSchemas";

const Register = () => {
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);
  const { updateUser } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      termsAccepted: false,
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const result = await client.POST("/signup", {
        body: { email: data.email, password: data.password, name: data.name },
      });
      return result;
    },
    onSuccess: async (response, variables) => {
      const user = response.data?.data?.user;

      if (response.response.status === 200) {
        // Check if email confirmation is required
        if (response.data?.data?.requiresEmailConfirmation) {
          router.replace({
            pathname: "/(auth)/EmailConfirmation",
            params: { email: variables.email },
          });
        } else {
          // Auto-login if session exists (no confirmation required)
          await AsyncStorage.setItem(
            "auth_token",
            response.data?.data?.session?.access_token || "",
          );
          await AsyncStorage.setItem(
            "refresh_token",
            response.data?.data?.session?.refresh_token || "",
          );
          if (user !== undefined && user.id && user.email) {
            updateUser({ id: user.id, email: user.email });
          }
          router.replace("/(tabs)/map");
        }
      }
    },
    onError: async (error: any) => {
      setApiError(error);
    },
  });

  const onSubmit = handleSubmit((data) => {
    signUpMutation.mutate(data);
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/bitmap.png")}
            style={styles.image}
          />
        </View>

        <ControlledPaperTextInput
          control={control}
          name="name"
          label="Name"
          style={styles.textInput}
          activeOutlineColor="black"
          textColor="black"
          autoCapitalize="words"
        />

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

        <ControlledCheckbox
          control={control}
          name="termsAccepted"
          color="white"
          labelComponent={
            <TouchableOpacity
              onPress={() => router.navigate("/AuthTerms")}
              style={styles.labelContainer}
            >
              <Text style={styles.label}>
                I agree to the{" "}
                <Text style={styles.linkText}>Terms and Conditions</Text>
              </Text>
            </TouchableOpacity>
          }
        />

        {signUpMutation.isPending ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <>
            <Button
              mode="contained"
              style={styles.registerButton}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              Register
            </Button>

            <Button
              onPress={() => router.replace("/(auth)/Login")}
              textColor="#007AFF"
              style={styles.button}
            >
              Already have an account?
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

        <APIErrorHandler error={apiError} onDismiss={() => setApiError(null)} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
  },
  textInput: {
    marginVertical: 5,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
  },
  registerButton: {
    backgroundColor: "#007AFF",
    marginVertical: 10,
  },
  labelContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    color: "white",
  },
  linkText: {
    color: "#007AFF",
  },
  button: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginVertical: 10,
  },
  privacyPolicyLink: {
    textAlign: "center",
    borderRadius: 4,
    padding: 1,
    marginRight: 10,
  },
  packageText: {
    fontSize: 14,
    marginBottom: 5,
    color: "white",
  },
});

export default Register;
