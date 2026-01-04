import { StyleSheet, Text, View } from "react-native";
import { Snackbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BaseToastProps } from "react-native-toast-message";

export const SuccessToast = ({ text1, text2 }: BaseToastProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { marginTop: insets.top + 90 }]}>
      <Snackbar
        visible={true}
        onDismiss={() => {}}
        style={styles.successSnackbar}
        duration={3000}
      >
        <View>
          {text1 && <Text style={styles.title}>{text1}</Text>}
          {text2 && <Text style={styles.message}>{text2}</Text>}
        </View>
      </Snackbar>
    </View>
  );
};

export const ErrorToast = ({ text1, text2 }: BaseToastProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { marginTop: insets.top + 90 }]}>
      <Snackbar
        visible={true}
        onDismiss={() => {}}
        style={styles.errorSnackbar}
        duration={3000}
      >
        <View>
          {text1 && <Text style={styles.title}>{text1}</Text>}
          {text2 && <Text style={styles.message}>{text2}</Text>}
        </View>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    zIndex: 9999,
    elevation: 9999,
  },
  successSnackbar: {
    backgroundColor: "#4CAF50",
  },
  errorSnackbar: {
    backgroundColor: "#F44336",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    fontWeight: "400",
    color: "white",
  },
});
