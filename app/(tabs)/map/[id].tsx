import Clipboard from "@react-native-clipboard/clipboard";
import Mapbox, { Camera, MapView, PointAnnotation } from "@rnmapbox/maps";
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
import LinearGradient from "react-native-linear-gradient";
import {
  Button,
  Card,
  IconButton,
  PaperProvider,
  Portal,
  Text,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../../components/APIErrorHandler";
import SubmitLocationDetailsModal from "../../../components/SubmitLocationDetailsModal";
import { useProtectedRoute } from "../../../hooks/useProtectedRoute";
import { useAuth } from "../../../providers/SessionProvider";
import { useUnitSystem } from "../../../providers/UnitSystemProvider";
import { useKyClient } from "../../../services/kyClient";
import { getHeightInPreferredUnit } from "../../../utils/unitConversions";
import type { Location as LocationType } from "./Map";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

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
    Toast.show({
      type: "success",
      text1: "Coordinates copied to clipboard",
      position: "top",
      visibilityTime: 1500,
    });
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
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading location...</Text>
      </LinearGradient>
    );
  }

  if (locationsError) {
    return (
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Error loading location data</Text>
        <Text style={styles.errorText}>{locationsError.message}</Text>
      </LinearGradient>
    );
  }

  if (!location) {
    return (
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Location not found</Text>
        <Text style={styles.errorText}>Location ID: {locationId}</Text>
      </LinearGradient>
    );
  }

  const isProcessing =
    saveLocationMutation.isPending || unsaveLocationMutation.isPending;

  return (
    <PaperProvider>
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
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

        <MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/satellite-streets-v12"
          logoEnabled={false}
          compassEnabled={true}
          compassViewPosition={2}
        >
          <Camera
            defaultSettings={{
              centerCoordinate: [
                location.longitude || 0,
                location.latitude || 0,
              ],
              zoomLevel: 14,
              pitch: 45,
            }}
          />
          <PointAnnotation
            id={`location-${location.id}`}
            coordinate={[location.longitude || 0, location.latitude || 0]}
            title={location.name || "Unknown Location"}
          >
            <View style={styles.marker} />
          </PointAnnotation>
        </MapView>

        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            mode="contained"
            buttonColor="#fff"
            textColor="#00ABF0"
            icon="map-marker"
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            onPress={openMaps}
          >
            Maps
          </Button>
          <Button
            style={styles.button}
            mode="contained"
            buttonColor="#fff"
            textColor="#00ABF0"
            icon="pencil"
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            onPress={() => setIsSubmitDetailsModalVisible(true)}
          >
            Update
          </Button>
          <Button
            style={styles.button}
            mode="contained"
            buttonColor={isSaved ? "#dc3545" : "#fff"}
            textColor={isSaved ? "#fff" : "#00ABF0"}
            icon={isSaved ? "heart-off" : "heart"}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
            onPress={onSave}
            disabled={isProcessing}
          >
            {isProcessing ? "..." : isSaved ? "Unsave" : "Save"}
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.tributeContainer}>
            <Text style={styles.tributeText}>
              Opened by{" "}
              {(location.opened_by_name || "Unknown").replace(
                /JOSH B/g,
                "Josh Bregmen",
              )}
              {location.opened_date ? ` • ${location.opened_date}` : ""}
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.coordinatesRow}>
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
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionLabel}>Location Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Rock Drop:</Text>
                <Text style={styles.infoValue}>
                  {getHeightInPreferredUnit(location.rock_drop_ft, isMetric)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total:</Text>
                <Text style={styles.infoValue}>
                  {getHeightInPreferredUnit(location.total_height_ft, isMetric)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliff Aspect:</Text>
                <Text style={styles.infoValue}>
                  {location.cliff_aspect || "?"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Anchor:</Text>
                <Text style={styles.infoValue}>
                  {location.anchor_info || "?"}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionLabel}>Access</Text>
              <Text style={styles.detailsText}>
                {location.access_info || "?"}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionLabel}>Notes</Text>
              <Text style={styles.detailsText}>{location.notes || "?"}</Text>
            </Card.Content>
          </Card>
        </ScrollView>
        <APIErrorHandler
          error={error || locationsError}
          onDismiss={() => setError(null)}
        />
      </LinearGradient>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  map: {
    width: "100%",
    height: 220,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  buttonContent: {
    height: 44,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  tributeContainer: {
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },
  tributeText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coordinatesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coordinatesContainer: {
    flex: 1,
  },
  coordinatesText: {
    fontSize: 13,
    color: "#1a1a1a",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  copyIconContainer: {
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
  },
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ca2222",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
