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
import { useUnitSystem } from "../providers/UnitSystemProvider";
import { getHeightInPreferredUnit } from "../utils/unitConversions";

export default function CustomCallout({ info }: { info: Location }) {
  const { isMetric } = useUnitSystem();

  const onDetailsPress = () => {
    router.push(`/(tabs)/map/${info.id}`);
  };

  return (
    <Callout onPress={() => onDetailsPress()}>
      <View style={styles.calloutContainer}>
        <Text style={styles.calloutTitle}>{info.name.toUpperCase()}</Text>
        <Text style={styles.calloutCoordinates}>
          Rock Drop: {getHeightInPreferredUnit(info.rock_drop_ft, isMetric)}
        </Text>
        <Text style={styles.calloutCoordinates}>
          Total: {getHeightInPreferredUnit(info.total_height_ft, isMetric)}
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
