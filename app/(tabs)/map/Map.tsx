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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, PaperProvider, Portal } from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import FiltersModal from "../../../components/FiltersModal";
import {
  MapControls,
  MarkerDetails,
  SearchBox,
  SubmitLocationButton,
} from "../../../components/Map";
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
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

  // Debounce search term to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const apiFilters: LocationsFilters = useMemo(() => {
    const filters: LocationsFilters = {};

    if (debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
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
  }, [debouncedSearchTerm, minRockDrop, maxRockDrop, isMetric]);

  const {
    data: locationsResponse,
    isFetching,
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
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates;
      const pointCount = feature.properties.point_count || 0;

      // Calculate zoom based on cluster size
      const currentZoom = event.coordinates?.zoom || 5;
      const zoomIncrement = pointCount > 50 ? 3 : pointCount > 10 ? 2.5 : 2;

      cameraRef.current?.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: currentZoom + zoomIncrement,
        animationDuration: 300,
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

  const handleMapStyleChange = () => {
    setSatelliteLoading(true);
    setTimeout(() => {
      setSatelliteActive(!satelliteActive);
      setSatelliteLoading(false);
    }, 100);
  };

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Portal>
            <FiltersModal
              isModalOpen={isFiltersVisible}
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
              clusterRadius={30}
              clusterMaxZoomLevel={6}
              onPress={handleMarkerPress}
            >
              {/* Cluster circles - all clusters */}
              <CircleLayer
                id="clusterCircles"
                filter={["has", "point_count"]}
                style={{
                  circleColor: [
                    "step",
                    ["get", "point_count"],
                    "#3B82F6",
                    25,
                    "#3B82F6",
                    100,
                    "#182d4e",
                  ],
                  circleRadius: [
                    "interpolate",
                    ["linear"],
                    ["get", "point_count"],
                    2,
                    18, // 2 points = 18px
                    10,
                    22, // 10 points = 22px
                    50,
                    28, // 50 points = 28px
                    100,
                    34, // 100+ points = 34px
                  ],
                  circleStrokeWidth: 3,
                  circleStrokeColor: "#ffffff",
                  circleOpacity: 0.9,
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

              {/* Individual markers only (not clustered at all) */}
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

          {/* Subtle loading indicator for search/filter refetches */}
          {isFetching && (
            <View style={styles.refetchIndicator}>
              <ActivityIndicator size="small" color="#00ABF0" />
            </View>
          )}

          {/* Map controls container */}
          <MapControls
            satelliteActive={satelliteActive}
            satelliteViewLoading={satelliteViewLoading}
            isMetric={isMetric}
            onSatelliteToggle={handleMapStyleChange}
            onUnitToggle={toggleUnitSystem}
            onFilterPress={() => setFiltersVisible(true)}
          />

          {/* Submit Location Button */}
          <SubmitLocationButton />

          <SearchBox value={searchTerm} onChangeText={setSearchTerm} />
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
  refetchIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
