import { MarkerView } from "@rnmapbox/maps";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Location } from "../../app/(tabs)/map/Map";
import { getHeightInPreferredUnit } from "../../utils/unitConversions";

interface MarkerDetailsProps {
  selectedLocation: Location;
  isMetric: boolean;
}

export const MarkerDetails = ({
  selectedLocation,
  isMetric,
}: MarkerDetailsProps) => {
  return (
    <MarkerView
      coordinate={[selectedLocation.longitude, selectedLocation.latitude]}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>
          {selectedLocation.name?.toUpperCase()}
        </Text>
        <Text style={styles.calloutText}>
          Rock Drop:{" "}
          {getHeightInPreferredUnit(selectedLocation.rock_drop_ft, isMetric)}
        </Text>
        <Text style={styles.calloutText}>
          Total:{" "}
          {getHeightInPreferredUnit(selectedLocation.total_height_ft, isMetric)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.push(`/(tabs)/map/${selectedLocation.id}`);
          }}
          style={styles.calloutButton}
        >
          <Text style={styles.calloutButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </MarkerView>
  );
};

const styles = StyleSheet.create({
  calloutContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    width: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
  },
  calloutTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 14,
  },
  calloutText: {
    marginBottom: 5,
    fontSize: 12,
    color: "#333",
  },
  calloutButton: {
    marginTop: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#00ABF0",
    alignItems: "center",
  },
  calloutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
});
