import { router } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Callout } from "react-native-maps";
import type { Location } from "../app/(tabs)/map/Map";
import { useUnitSystem } from "../context/UnitSystemContext";

export default function CustomCallout({ info }: { info: Location }) {
  const { isMetric } = useUnitSystem();

  const onDetailsPress = () => {
    router.push(`/(tabs)/map/${info.id}`);
  };

  // TODO: Move this to a utility file - it is reused in multiple places
  const convertToMeters = (value: number) => {
    return value ? `${Math.round(value * 0.3048)} meters` : "?";
  };

  return (
    <Callout onPress={() => onDetailsPress()}>
      <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{info.name.toUpperCase()}</Text>
        <Text style={styles.calloutCoordinates}>
          Rock Drop:{" "}
          {isMetric
            ? convertToMeters(info.rock_drop_ft ?? 0)
            : info.rock_drop_ft
              ? `${info.rock_drop_ft} ft`
              : "?"}
        </Text>
        <Text style={styles.calloutCoordinates}>
          Total:{" "}
          {isMetric
            ? convertToMeters(info.total_height_ft ?? 0)
            : info.total_height_ft
              ? `${info.total_height_ft} ft`
              : "?"}
        </Text>
        {Platform.OS === "ios" && (
          <TouchableOpacity
            onPress={() => onDetailsPress()}
            style={styles.calloutButton}
          >
            <Text style={styles.calloutButtonText}>Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </Callout>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    width: 200,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "white",
  },
  calloutTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  calloutCoordinates: {
    marginBottom: 5,
  },
  calloutButton: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "black",
  },
  savedButton: {
    backgroundColor: "red",
  },
  calloutButtonText: {
    color: "white",
  },
});
