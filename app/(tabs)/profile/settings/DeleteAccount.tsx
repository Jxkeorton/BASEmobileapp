import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

const DeleteAccount = () => {
  // TODO: implement delete account using new API
  const deleteAccount = () => {};

  const handleDeleteAccount = async () => {
    deleteAccount();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Are you sure you want to delete your account?
      </Text>
      <Button onPress={handleDeleteAccount} style={styles.button}>
        <Text style={styles.buttonTitle}>Delete Account</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#00ABF0",
    alignItems: "center",
    marginTop: 30,
  },
  buttonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  text: {
    fontSize: 19,
    alignContent: "center",
    textAlign: "center",
  },
});

export default DeleteAccount;
