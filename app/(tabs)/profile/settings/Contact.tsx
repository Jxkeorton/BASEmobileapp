import { FontAwesome } from "@expo/vector-icons";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Contact = () => {
  const handleInstagramPress = () => {
    // Use the Instagram URL scheme to open the Instagram app.
    Linking.openURL("instagram://user?username=jakeorton_").catch(() => {
      // If the Instagram app is not installed, handle the error.
      Linking.openURL("https://www.instagram.com/jakeorton_");
    });
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.paragraph}>
          {" "}
          We value your feedback on how we can improve the app{" "}
        </Text>
        <Text style={styles.text}>worldbasemap@gmail.com</Text>
        <Text style={styles.text}>(+44) 7986273803</Text>
        <TouchableOpacity onPress={handleInstagramPress}>
          <FontAwesome
            name="instagram"
            size={30}
            color="white"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    marginHorizontal: 30,
    padding: 20,
    borderRadius: 30,
  },
  text: {
    fontSize: 19,
    alignContent: "center",
    textAlign: "center",
    marginTop: 10,
    color: "white",
  },
  icon: {
    marginTop: 10,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  paragraph: {
    fontSize: 19,
    alignContent: "center",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 50,
    marginHorizontal: 30,
    color: "white",
  },
});

export default Contact;
