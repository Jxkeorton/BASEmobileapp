import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TouchableHighlight, View } from "react-native";
import SubmitLocationModal from "../SubmitLocationModal";

export const SubmitLocationButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <TouchableHighlight
        onPress={() => setIsModalOpen(true)}
        underlayColor="#E0E0E0"
        style={styles.submitLocationButton}
      >
        <View style={styles.controlButtonContent}>
          <FontAwesome name="plus" size={20} color="#333" />
        </View>
      </TouchableHighlight>
      <SubmitLocationModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="new"
      />
    </>
  );
};

const styles = StyleSheet.create({
  submitLocationButton: {
    position: "absolute",
    top: 60,
    left: 10,
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 44,
    height: 44,
    zIndex: 1000,
  },
  controlButtonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
