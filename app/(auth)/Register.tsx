import AsyncStorage from "@react-native-async-storage/async-storage";
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
import {
  ActivityIndicator,
  Button,
  Checkbox,
  Text,
  TextInput,
} from "react-native-paper";
import APIErrorHandler from "../../components/APIErrorHandler";
import { useAuth } from "../../providers/AuthProvider";
import { useKyClient } from "../../services/kyClient";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setDisplayName] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const client = useKyClient();
  const [apiError, setApiError] = useState<any>(null);

  const { updateUser } = useAuth();

  interface SignUpBody {
    email: string;
    password: string;
    name: string;
  }

  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, name }: SignUpBody) => {
      const result = await client.POST("/signup", {
        body: { email, password, name },
      });
      return result;
    },
    onSuccess: async (response) => {
      const user = response.data?.data?.user;

      if (response.response.status === 200) {
        // Check if email confirmation is required
        if (response.data?.data?.requiresEmailConfirmation) {
          router.replace({
            pathname: "/(auth)/EmailConfirmation",
            params: { email: email },
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

  const handleSignUp = async () => {
    signUpMutation.mutate({ email, password, name: name });
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
            value={name}
            style={styles.textInput}
            placeholder="Name"
            autoCapitalize="words"
            onChangeText={(text) => setDisplayName(text.trim())}
          />
          <TextInput
            value={email}
            style={styles.textInput}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text.trim().toLowerCase())}
          />
          <TextInput
            secureTextEntry={true}
            value={password}
            style={styles.textInput}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}
          />

          <View style={styles.checkboxContainer}>
            <View style={styles.checkbox}>
              <Checkbox
                status={termsChecked ? "checked" : "unchecked"}
                onPress={() => setTermsChecked(!termsChecked)}
                color="white"
              />
            </View>
            <Button
              textColor="black"
              onPress={() => router.navigate("/AuthTerms")}
            >
              <Text style={styles.packageText}>
                I agree to the Terms and Conditions
              </Text>
            </Button>
          </View>

          {signUpMutation.isPending ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <>
              <Button
                mode="contained"
                style={styles.registerButton}
                onPress={handleSignUp}
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
    width: 100,
    height: 100,
  },
  textInput: {
    marginVertical: 10,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
  },
  registerButton: {
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 4,
    padding: 1,
    marginRight: 10,
  },
  packageText: {
    fontSize: 14,
    marginBottom: 5,
    color: "white",
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Register;
