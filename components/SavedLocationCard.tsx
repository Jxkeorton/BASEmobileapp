import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, Text as Text2 } from "react-native-paper";
import { SavedLocationsArray } from "../app/(tabs)/profile/Profile";
import { useUnitSystem } from "../providers/UnitSystemProvider";
import { getHeightInPreferredUnit } from "../utils/unitConversions";

interface SavedLocationCardProps {
  data: SavedLocationsArray;
  onDelete: (id: number) => void;
}

const SavedLocationCard = ({ data, onDelete }: SavedLocationCardProps) => {
  const { isMetric } = useUnitSystem();
  const onDetailsPress = (itemId: number) => {
    router.navigate(`/(tabs)/map/${itemId}`);
  };

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ justifyContent: "center" }}>
          <Text style={styles.emptyText}>Visit the Map to save locations</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.map((item) => (
        <View key={item.save_id} style={styles.card}>
          <Card style={styles.cardStyle}>
            <Card.Content style={styles.cardContent}>
              <Text2 variant="titleMedium" style={styles.locationName}>
                {item.location.name}
              </Text2>
              <Text style={styles.calloutCoordinates}>
                Rock Drop:{" "}
                {getHeightInPreferredUnit(item.location.rock_drop_ft, isMetric)}
              </Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button
                mode="text"
                textColor="#00ABF0"
                onPress={() => onDetailsPress(item.location.id)}
              >
                Details
              </Button>
              <Button
                mode="contained"
                buttonColor="#00ABF0"
                textColor="#fff"
                onPress={() => onDelete(item.location.id)}
              >
                Unsave
              </Button>
            </Card.Actions>
          </Card>
        </View>
      ))}
    </View>
  );
};

export default SavedLocationCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#fff",
  },
  emptyText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 15,
  },
  card: {
    marginVertical: 6,
    width: "100%",
  },
  cardStyle: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardContent: {
    paddingBottom: 8,
  },
  locationName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  calloutCoordinates: {
    marginBottom: 5,
    fontSize: 14,
    color: "#666",
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
