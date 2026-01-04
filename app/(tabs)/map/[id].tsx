import Clipboard from "@react-native-clipboard/clipboard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  Button,
  Divider,
  IconButton,
  PaperProvider,
  Portal,
  Text,
} from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import SubmitLocationDetailsModal from "../../../components/SubmitLocationDetailsModal";
import { useProtectedRoute } from "../../../hooks/useProtectedRoute";
import { useAuth } from "../../../providers/AuthProvider";
import { useUnitSystem } from "../../../providers/UnitSystemProvider";
import { useKyClient } from "../../../services/kyClient";
import { getHeightInPreferredUnit } from "../../../utils/unitConversions";
import type { Location as LocationType } from "./Map";

export default function Location() {
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitDetailsModalVisible, setIsSubmitDetailsModalVisible] =
    useState(false);
  const [error, setError] = useState<any>(null);

  const { id } = useLocalSearchParams();
  const { isMetric } = useUnitSystem();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const client = useKyClient();
  const { loading: revenueCatLoading } = useProtectedRoute();

  const locationId = id && !Array.isArray(id) ? parseInt(id) : NaN;

  const {
    data: locationsResponse,
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      return client.GET("/locations").then((res) => {
        if (res.error) {
          throw new Error("Failed to fetch locations");
        }
        return res.data;
      });
    },
  });

  const { data: savedLocationsResponse } = useQuery({
    queryKey: ["savedLocations", user?.id],
    queryFn: async () => {
      return client.GET("/locations/saved").then((res) => {
        if (res.error) {
          throw new Error("Failed to fetch saved locations");
        }
        return res.data;
      });
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const saveLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const res = await client.POST("/locations/save", {
        body: { location_id: locationId },
      });
      return res.data;
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ["savedLocations"] });
      }
    },
    onError: (err: any) => {
      setError(err);
    },
  });

  const unsaveLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const res = await client.DELETE("/locations/unsave", {
        body: { location_id: locationId },
      });
      return res.data;
    },
    onSuccess: (response) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ["savedLocations"] });
      }
    },
    onError: (err: any) => {
      setError(err);
    },
  });

  const location: LocationType | undefined = useMemo(() => {
    const locations = locationsResponse?.success ? locationsResponse.data : [];

    if (!locations) {
      return undefined;
    }

    if (locations && Array.isArray(locations)) {
      return locations.find((loc) => loc.id === locationId);
    }

    return undefined;
  }, [locationsResponse, locationId]);

  const isSaved = useMemo(() => {
    if (
      !savedLocationsResponse?.success ||
      !savedLocationsResponse?.data?.saved_locations
    ) {
      return false;
    }
    return savedLocationsResponse.data.saved_locations.some(
      (savedLoc) => savedLoc.location?.id === locationId,
    );
  }, [savedLocationsResponse, locationId]);

  const copyToClipboard = () => {
    if (!location?.latitude || !location?.longitude) return;

    const coordinatesText = `${location.latitude}, ${location.longitude}`;

    Clipboard.setString(coordinatesText);
    setIsCopied(true);
  };

  const onSave = async () => {
    if (!isAuthenticated) {
      setError({ message: "Please log in to save locations" });
      return;
    }

    if (isSaved) {
      await unsaveLocationMutation.mutateAsync(locationId);
    } else {
      await saveLocationMutation.mutateAsync(locationId);
    }
  };

  const openMaps = () => {
    if (!location?.latitude || !location?.longitude) return;

    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
    });

    if (!scheme) return;

    const latLng = `${location.latitude},${location.longitude}`;
    const label = location.name || "Location";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  if (locationsLoading || revenueCatLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ABF0" />
        <Text style={styles.loadingText}>Loading location...</Text>
      </View>
    );
  }

  if (locationsError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Error loading location data</Text>
        <Text style={styles.text}>{locationsError.message}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Location not found</Text>
        <Text style={styles.text}>Location ID: {locationId}</Text>
      </View>
    );
  }

  const isProcessing =
    saveLocationMutation.isPending || unsaveLocationMutation.isPending;

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Portal>
          <SubmitLocationDetailsModal
            visible={isSubmitDetailsModalVisible}
            onClose={() => setIsSubmitDetailsModalVisible(false)}
            location={location}
          />
        </Portal>

        <Stack.Screen
          options={{
            title: location.name.toUpperCase(),
          }}
        />

        <View style={styles.centeredContainer}>
          <View style={styles.buttonContainer}>
            <Button style={styles.button} mode="contained" onPress={openMaps}>
              Open in maps
            </Button>
            <Button
              style={styles.button}
              mode="contained"
              onPress={() => setIsSubmitDetailsModalVisible(true)}
            >
              Update
            </Button>
            <Button
              style={[styles.button, isSaved ? styles.savedButton : null]}
              mode="contained"
              onPress={onSave}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : isSaved ? "Unsave" : "Save"}
            </Button>
          </View>
        </View>

        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude || 0,
            longitude: location.longitude || 0,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          mapType="hybrid"
        >
          <Marker
            coordinate={{
              latitude: location.latitude || 0,
              longitude: location.longitude || 0,
            }}
            title={location.name || "Unknown Location"}
            description={location.opened_by_name || "Unknown"}
            pinColor="#00ABF0"
          />
        </MapView>

        <ScrollView>
          <View style={styles.openedByContainer}>
            <Text style={styles.openedByText}>
              {(location.opened_by_name || "Unknown")
                .replace(/JOSH B/g, "JOSH BREGMEN")
                .toUpperCase()}
            </Text>
            <Text style={styles.openedByText}>
              {location.opened_date || "Unknown date"}
            </Text>
          </View>
          <Divider />

          <View style={styles.openedByContainer}>
            <View style={styles.coordinatesContainer}>
              <Text style={styles.coordinatesText}>
                {location.latitude || "N/A"}, {location.longitude || "N/A"}
              </Text>
            </View>
            <View style={styles.copyIconContainer}>
              <IconButton
                icon="content-copy"
                iconColor={isCopied ? "black" : "grey"}
                size={15}
                onPress={copyToClipboard}
                disabled={!location.latitude || !location.longitude}
              />
            </View>
          </View>
          <Divider />

          <View style={styles.mainContainer}>
            <View>
              <Text style={styles.subtitleText}>Rock Drop: </Text>
              <Text style={styles.subtitleText}>Total: </Text>
              <Text style={styles.subtitleText}>Cliff Aspect: </Text>
              <Text style={styles.subtitleText}>Anchor: </Text>
            </View>
            <View>
              <Text style={styles.text}>
                {getHeightInPreferredUnit(location.rock_drop_ft, isMetric)}
              </Text>
              <Text style={styles.text}>
                {getHeightInPreferredUnit(location.total_height_ft, isMetric)}
              </Text>
              <Text style={styles.text}>{location.cliff_aspect || "?"}</Text>
              <Text style={styles.text}>{location.anchor_info || "?"}</Text>
            </View>
          </View>
          <Divider />

          <View style={styles.mainContainer}>
            <Text style={styles.subtitleText}>Access: </Text>
            <Text style={styles.text}>{location.access_info || "?"}</Text>
          </View>
          <Divider />

          <Text style={styles.subtitleText}>Notes: </Text>
          <Text style={styles.text}>{location.notes || "?"}</Text>
        </ScrollView>
        <APIErrorHandler
          error={error || locationsError}
          onDismiss={() => setError(null)}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  centeredContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  map: {
    width: "100%",
    height: "40%",
  },
  text: {
    marginBottom: 10,
    fontSize: 16,
    paddingLeft: 10,
  },
  subtitleText: {
    marginBottom: 10,
    paddingLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    width: "80%",
    marginVertical: 5,
    padding: 5,
    backgroundColor: "white",
  },
  button: {
    marginHorizontal: 5,
    backgroundColor: "#00ABF0",
  },
  openedByText: {
    fontSize: 11,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  openedByContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  savedButton: {
    backgroundColor: "red",
  },
  coordinatesContainer: {
    flex: 1,
  },
  coordinatesText: {
    fontSize: 11,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  copyIconContainer: {
    marginLeft: 5,
  },
});
