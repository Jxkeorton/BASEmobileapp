import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, Button, TextInput } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../../../components/APIErrorHandler";
import { useAuth } from "../../../../providers/SessionProvider";
import { useKyClient } from "../../../../services/kyClient";

const DeleteAccount = () => {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [apiError, setApiError] = useState<any>(null);

  const client = useKyClient();
  const { signOut } = useAuth();

  const deleteAccountMutation = useMutation({
    mutationFn: async ({
      password,
      confirmation,
    }: {
      password: string;
      confirmation: string;
    }) => {
      const body: {
        confirmation: string;
        password?: string;
      } = {
        confirmation,
      };

      if (password) {
        body.password = password;
      }

      const result = await client.DELETE("/delete-account", {
        body,
      });

      return result;
    },
    onSuccess: async (_response: any) => {
      Toast.show({
        type: "success",
        text1: "Account Deleted",
        text2: "Your account has been permanently deleted.",
      });

      await signOut();
    },
    onError: (error: any) => {
      setApiError(error);
    },
  });

  const handleDeleteAccount = async () => {
    setApiError(null);

    // Delete account
    deleteAccountMutation.mutate({ password, confirmation });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.warningText}>Warning: This is permanent!</Text>
        <Text style={styles.text}>
          Deleting your account will permanently remove all your data, including
          your profile, logbook entries, and saved locations. This action cannot
          be undone.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Type &quot;DELETE&quot; to confirm (case-insensitive):
          </Text>
          <TextInput
            value={confirmation}
            style={styles.textInput}
            placeholder="Type DELETE"
            autoCapitalize="characters"
            onChangeText={(text) => setConfirmation(text)}
            mode="outlined"
          />

          <Text style={styles.label}>
            Password (leave empty for OAuth users):
          </Text>
          <TextInput
            secureTextEntry={true}
            value={password}
            style={styles.textInput}
            placeholder="Enter your password"
            autoCapitalize="none"
            onChangeText={(text) => setPassword(text)}
            mode="outlined"
          />
        </View>

        <APIErrorHandler error={apiError} />

        {deleteAccountMutation.isPending ? (
          <ActivityIndicator size="large" color="#FF0000" />
        ) : (
          <Button
            onPress={handleDeleteAccount}
            style={styles.button}
            mode="contained"
            buttonColor="#FF0000"
          >
            <Text style={styles.buttonTitle}>Delete Account</Text>
          </Button>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  warningText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF0000",
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#fff",
  },
  button: {
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
});

export default DeleteAccount;
