import { FontAwesome } from "@expo/vector-icons";
import Mapbox, {
  Camera,
  CircleLayer,
  LocationPuck,
  MapView,
  ShapeSource,
  SymbolLayer,
  Terrain,
} from "@rnmapbox/maps";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, PaperProvider, Portal } from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import FiltersModal from "../../../components/FiltersModal";
import { MarkerDetails } from "../../../components/Map/MarkerDetails";
import { useUnitSystem } from "../../../providers/UnitSystemProvider";
import { useKyClient } from "../../../services/kyClient";
import type { paths } from "../../../types/api";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || "");

type LocationsResponse =
  paths["/locations"]["get"]["responses"][200]["content"]["application/json"];
export type Location = NonNullable<LocationsResponse["data"]>[number];

type LocationsFilters = paths["/locations"]["get"]["parameters"]["query"];

// Type for ShapeSource onPress event
type OnPressEvent = {
  features: Array<GeoJSON.Feature>;
  coordinates: {
    latitude: number;
    longitude: number;
    zoom?: number;
  };
  point: {
    x: number;
    y: number;
  };
};

export default function Map() {
  const [searchTerm, setSearchTerm] = useState("");
  const [satelliteActive, setSatelliteActive] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const client = useKyClient();

  const [satelliteViewLoading, setSatelliteLoading] = useState(false);

  // Filter modal state
  const [minRockDrop, setMinRockDrop] = useState("");
  const [maxRockDrop, setMaxRockDrop] = useState("");
  const [unknownRockdrop, setUnknownRockDrop] = useState(false);
  const [isFiltersVisible, setFiltersVisible] = useState(false);

  const { isMetric, toggleUnitSystem } = useUnitSystem();
  const cameraRef = useRef<Camera>(null);

  const apiFilters: LocationsFilters = useMemo(() => {
    const filters: LocationsFilters = {};

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }

    if (minRockDrop !== "") {
      const minHeightFt = isMetric
        ? parseFloat(minRockDrop) / 0.3048
        : parseFloat(minRockDrop);
      filters.min_height = Math.round(minHeightFt);
    }

    if (maxRockDrop !== "") {
      const maxHeightFt = isMetric
        ? parseFloat(maxRockDrop) / 0.3048
        : parseFloat(maxRockDrop);
      filters.max_height = Math.round(maxHeightFt);
    }

    return filters;
  }, [searchTerm, minRockDrop, maxRockDrop, isMetric]);

  const {
    data: locationsResponse,
    isLoading: loadingMap,
    error,
  } = useQuery({
    queryKey: ["locations", apiFilters],
    queryFn: async () => {
      return client
        .GET("/locations", {
          params: { query: { ...apiFilters } },
        })
        .then((res) => {
          if (res.error) {
            throw new Error("Failed to fetch locations");
          }
          return res.data;
        });
    },
  });
  const locations = locationsResponse?.success ? locationsResponse.data : [];

  const filterEventsByRockDrop = (location: Location) => {
    if (unknownRockdrop) {
      const hasUnknownHeight =
        !location.total_height_ft ||
        location.total_height_ft === 0 ||
        (location.rock_drop_ft &&
          (!location.rock_drop_ft || location.rock_drop_ft === 0));
      return !hasUnknownHeight;
    }

    return true;
  };

  // Convert locations to GeoJSON FeatureCollection for clustering
  const geoJsonSource = useMemo(() => {
    const filteredLocations = locations?.filter(filterEventsByRockDrop) || [];
    return {
      type: "FeatureCollection" as const,
      features: filteredLocations.map((location) => ({
        type: "Feature" as const,
        id: location.id,
        geometry: {
          type: "Point" as const,
          coordinates: [location.longitude, location.latitude],
        },
        properties: {
          id: location.id,
          name: location.name || "Unknown Name",
          total_height_ft: location.total_height_ft,
          rock_drop_ft: location.rock_drop_ft,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      })),
    };
  }, [locations, unknownRockdrop]);

  const handleMarkerPress = (event: OnPressEvent) => {
    const feature = event.features[0];
    if (!feature) return;

    // Check if it's a cluster
    if (feature.properties?.cluster) {
      // Zoom into the cluster
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates;
      cameraRef.current?.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: (event.coordinates?.zoom || 5) + 2,
        animationDuration: 500,
      });
    } else {
      // It's an individual marker - find the location and select it
      const locationId = feature.properties?.id;
      const location = locations?.find((loc) => loc.id === locationId);
      if (location) {
        setSelectedLocation(location);
      }
    }
  };

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Portal>
            <FiltersModal
              visible={isFiltersVisible}
              onClose={() => setFiltersVisible(false)}
              onApplyFilter={(min: string, max: string, unknown: boolean) => {
                setMinRockDrop(min);
                setMaxRockDrop(max);
                setUnknownRockDrop(unknown);
              }}
              minRockDrop={minRockDrop}
              maxRockDrop={maxRockDrop}
            />
          </Portal>

          {loadingMap ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ABF0" />
              <Text style={styles.loadingText}>Loading locations...</Text>
            </View>
          ) : (
            <>
              <MapView
                style={styles.map}
                styleURL={
                  satelliteActive
                    ? "mapbox://styles/mapbox/satellite-streets-v12"
                    : "mapbox://styles/jakeorton99/clopszx4t00k101pb70b0crpc"
                }
                logoEnabled={false}
                compassEnabled={true}
                compassViewPosition={2}
                compassViewMargins={{
                  x: 15,
                  y: 25,
                }}
                scaleBarPosition={{ bottom: 8, left: 8 }}
                onPress={() => {
                  if (selectedLocation) {
                    setSelectedLocation(null);
                  }
                }}
              >
                <Camera
                  ref={cameraRef}
                  defaultSettings={{
                    centerCoordinate: [0, 20],
                    zoomLevel: 2,
                    pitch: 45,
                  }}
                />
                <LocationPuck
                  puckBearingEnabled
                  puckBearing="heading"
                  pulsing={{ isEnabled: true }}
                />
                <Terrain sourceID="mapbox-dem" style={{ exaggeration: 1.5 }} />

                {/* Clustered markers */}
                <ShapeSource
                  id="locationsSource"
                  shape={geoJsonSource}
                  cluster={true}
                  clusterRadius={50}
                  clusterMaxZoomLevel={14}
                  onPress={handleMarkerPress}
                >
                  {/* Cluster circles */}
                  <CircleLayer
                    id="clusterCircles"
                    filter={["has", "point_count"]}
                    style={{
                      circleColor: [
                        "step",
                        ["get", "point_count"],
                        "#000000",
                        10,
                        "#000000",
                        50,
                        "#000000",
                      ],
                      circleRadius: [
                        "step",
                        ["get", "point_count"],
                        20,
                        10,
                        25,
                        50,
                        30,
                      ],
                      circleStrokeWidth: 2,
                      circleStrokeColor: "#ffffff",
                    }}
                  />

                  {/* Cluster count labels */}
                  <SymbolLayer
                    id="clusterCount"
                    filter={["has", "point_count"]}
                    style={{
                      textField: ["get", "point_count_abbreviated"],
                      textSize: 14,
                      textColor: "#FFFFFF",
                      textFont: ["DIN Pro Medium", "Arial Unicode MS Bold"],
                    }}
                  />

                  {/* Individual markers (non-clustered) */}
                  <CircleLayer
                    id="singlePoint"
                    filter={["!", ["has", "point_count"]]}
                    style={{
                      circleColor: "#ca2222",
                      circleRadius: 10,
                      circleStrokeWidth: 2,
                      circleStrokeColor: "#ffffff",
                    }}
                  />
                </ShapeSource>

                {selectedLocation && (
                  <MarkerDetails
                    selectedLocation={selectedLocation}
                    isMetric={isMetric}
                  />
                )}
              </MapView>
            </>
          )}

          {/* Map controls container */}
          {!loadingMap && (
            <View style={styles.mapControlsContainer}>
              {/* Satellite toggle button */}
              <TouchableHighlight
                onPress={() => {
                  setSatelliteLoading(true);
                  setTimeout(() => {
                    setSatelliteActive(!satelliteActive);
                    setSatelliteLoading(false);
                  }, 100);
                }}
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
                onPress={toggleUnitSystem}
                underlayColor="#E0E0E0"
                style={styles.controlButton}
              >
                <View style={styles.controlButtonContent}>
                  <Text style={styles.unitButtonText}>
                    {isMetric ? "M" : "Ft"}
                  </Text>
                </View>
              </TouchableHighlight>

              {/* Filter button */}
              <TouchableHighlight
                onPress={() => setFiltersVisible(true)}
                underlayColor="#E0E0E0"
                style={styles.controlButton}
              >
                <View style={styles.controlButtonContent}>
                  <FontAwesome name="filter" size={20} color="#333" />
                </View>
              </TouchableHighlight>
            </View>
          )}

          <View style={styles.searchBox}>
            <TextInput
              placeholder="Search here"
              placeholderTextColor="#000"
              autoCapitalize="none"
              style={styles.searchInput}
              onChangeText={(text) => setSearchTerm(text)}
              value={searchTerm}
            />
          </View>
          <APIErrorHandler error={error} />
        </View>
      </TouchableWithoutFeedback>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  bubble: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 0.5,
    padding: 15,
    width: 150,
  },
  name: {
    fontSize: 16,
    marginBottom: 5,
  },
  arrowBorder: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#007a87",
    borderWidth: 16,
    alignSelf: "center",
    marginTop: -0.5,
  },
  arrow: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderTopColor: "#fff",
    borderWidth: 16,
    alignSelf: "center",
    marginTop: -32,
  },
  searchBox: {
    position: "absolute",
    backgroundColor: "#fff",
    width: "95%",
    alignSelf: "center",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    marginTop: 60,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
    backgroundColor: "black",
  },
  text: {
    color: "white",
  },
  buttonSatellite: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "black",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 10,
  },
  switchLabel: {
    marginHorizontal: 5,
    color: "black",
  },
  // modal styles
  dropdownIcon: {
    marginLeft: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
    marginBottom: 10,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "gray",
    height: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: 200,
  },
  modalFooter: {
    marginTop: 20,
    alignItems: "center",
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#00ABF0",
    alignItems: "center",
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  filterButton: {
    marginLeft: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginHorizontal: 20,
  },
  resultsContainer: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resultsText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: "white",
  },
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
