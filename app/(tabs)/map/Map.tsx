import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView from "react-native-map-clustering";
import { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  ActivityIndicator,
  PaperProvider,
  Portal,
  Switch,
} from "react-native-paper";
import CustomCallout from "../../../components/CustomCallout";
import ModalContent from "../../../components/ModalContent";
import { useUnitSystem } from "../../../context/UnitSystemContext";
import { useKyClient } from "../../../services/kyClient";
import type { paths } from "../../../types/api";

type LocationsResponse =
  paths["/locations"]["get"]["responses"][200]["content"]["application/json"];
export type Location = NonNullable<LocationsResponse["data"]>[number];

type LocationsFilters = paths["/locations"]["get"]["parameters"]["query"];

export default function Map() {
  const [searchTerm, setSearchTerm] = useState("");
  const [satelliteActive, setSatelliteActive] = useState(false);
  const client = useKyClient();

  // Loading states for UI interactions
  const [satelliteViewLoading, setSatelliteLoading] = useState(false);
  const [filterIconLoading, setFilterIconLoading] = useState(false);

  // Filter modal state
  const [minRockDrop, setMinRockDrop] = useState("");
  const [maxRockDrop, setMaxRockDrop] = useState("");
  const [unknownRockdrop, setUnknownRockDrop] = useState(false);
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const { isMetric } = useUnitSystem();

  // Build API filters based on current search and filters
  const apiFilters: LocationsFilters = useMemo(() => {
    const filters: LocationsFilters = {};

    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }

    // Convert height filters to API format (assuming your API uses total_height_ft)
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

  // TanStack Query
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

  // Handle loading and error states
  if (error) {
    console.error("Locations API Error:", error);
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>
          Error loading locations: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <PaperProvider>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Portal>
            <ModalContent
              visible={visible}
              onClose={hideModal}
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
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 56.25284254305279,
                longitude: -2.653906767865911,
                latitudeDelta: 14.138225243481841,
                longitudeDelta: 14.52603159394414,
              }}
              mapType={satelliteActive ? "hybrid" : "standard"}
              clusterColor="black"
              clusterTextColor="white"
              clusteringEnabled={true}
              provider={PROVIDER_GOOGLE}
            >
              {locations &&
                locations
                  .filter((event) => filterEventsByRockDrop(event))
                  .map((event, index) => {
                    const latitude = event.latitude;
                    const longitude = event.longitude;

                    if (!latitude || !longitude) {
                      console.warn("Invalid coordinates for event:", event);
                      return null;
                    }

                    return (
                      <Marker
                        key={event.id || index}
                        coordinate={{ latitude, longitude }}
                        title={event.name || "Unknown Name"}
                        description={
                          event.opened_by_name || event.country || ""
                        }
                        pinColor="red"
                      >
                        <CustomCallout info={event} />
                      </Marker>
                    );
                  })}
            </MapView>
          )}

          <View style={styles.searchBox}>
            <View style={styles.textInputContainer}>
              <TextInput
                placeholder="Search here"
                placeholderTextColor="#000"
                autoCapitalize="none"
                style={{ flex: 1, padding: 0 }}
                onChangeText={(text) => setSearchTerm(text)}
                value={searchTerm}
              />
              <TouchableHighlight
                onPress={async () => {
                  setFilterIconLoading(true);
                  showModal();
                  setFilterIconLoading(false);
                }}
                underlayColor="#DDDDDD"
                style={styles.filterButton}
              >
                <View style={styles.dropdownIcon}>
                  {filterIconLoading ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                  ) : (
                    <FontAwesome name="filter" size={20} color="#000" />
                  )}
                </View>
              </TouchableHighlight>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Satellite</Text>
              {satelliteViewLoading ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <Switch
                  value={satelliteActive}
                  onValueChange={() => {
                    setSatelliteLoading(true);
                    setTimeout(() => {
                      setSatelliteActive(!satelliteActive);
                      setSatelliteLoading(false);
                    }, 100);
                  }}
                  color="#00ABF0"
                />
              )}
              <Text style={[styles.switchLabel, { paddingLeft: 5 }]}>
                Imperial
              </Text>
              <Switch
                value={isMetric}
                onValueChange={() => {}} // This should be handled by UnitSystemContext
                color="#00ABF0"
              />
              <Text style={styles.switchLabel}>Metric</Text>
            </View>
          </View>

          {/* Show results count */}
          {!loadingMap && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                {locations?.length || 0} location
                {(locations?.length || 0) !== 1 ? "s" : ""} found
              </Text>
            </View>
          )}
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
    width: "90%",
    alignSelf: "center",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    marginTop: 50,
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
  textInputContainer: {
    flexDirection: "row",
    marginRight: 10,
    marginBottom: 10,
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
    marginBottom: 10,
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
});
