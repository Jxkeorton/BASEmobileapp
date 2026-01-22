import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableHighlight, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

type MapControlsProps = {
  satelliteActive: boolean;
  satelliteViewLoading: boolean;
  isMetric: boolean;
  onSatelliteToggle: () => void;
  onUnitToggle: () => void;
  onFilterPress: () => void;
};

export const MapControls = ({
  satelliteActive,
  satelliteViewLoading,
  isMetric,
  onSatelliteToggle,
  onUnitToggle,
  onFilterPress,
}: MapControlsProps) => {
  return (
    <View style={styles.mapControlsContainer}>
      {/* Satellite toggle button */}
      <TouchableHighlight
        onPress={onSatelliteToggle}
        underlayColor="#E0E0E0"
        style={styles.controlButton}
      >
        <View style={styles.controlButtonContent}>
          {satelliteViewLoading ? (
            <ActivityIndicator size="small" color="#00ABF0" />
          ) : (
            <FontAwesome
              name={satelliteActive ? "globe" : "map"}
              size={20}
              color="#333"
            />
          )}
        </View>
      </TouchableHighlight>

      {/* Unit toggle button */}
      <TouchableHighlight
        onPress={onUnitToggle}
        underlayColor="#E0E0E0"
        style={styles.controlButton}
      >
        <View style={styles.controlButtonContent}>
          <Text style={styles.unitButtonText}>{isMetric ? "M" : "Ft"}</Text>
        </View>
      </TouchableHighlight>

      {/* Filter button */}
      <TouchableHighlight
        onPress={onFilterPress}
        underlayColor="#E0E0E0"
        style={styles.controlButton}
      >
        <View style={styles.controlButtonContent}>
          <FontAwesome name="filter" size={20} color="#333" />
        </View>
      </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
  mapControlsContainer: {
    position: "absolute",
    top: 115,
    right: 10,
    gap: 10,
    zIndex: 1000,
  },
  controlButton: {
    backgroundColor: "white",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 44,
    height: 44,
  },
  controlButtonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});
