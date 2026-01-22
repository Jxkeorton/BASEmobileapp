import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

type LoadingOverlayProps = {
  loadingLocations: boolean;
};

export const LoadingOverlay = ({ loadingLocations }: LoadingOverlayProps) => {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="#00ABF0" />
      <Text style={styles.loadingText}>
        {loadingLocations ? "Loading locations..." : "Loading map..."}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
});
