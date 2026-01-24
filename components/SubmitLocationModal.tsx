import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";
import { Location } from "../app/(tabs)/map/Map";
import { useKyClient } from "../services/kyClient";
import { paths } from "../types/api";
import { convertToFeet } from "../utils/unitConversions";
import {
  parseCoordinates,
  unifiedLocationSchema,
  type UnifiedLocationFormData,
} from "../utils/validationSchemas";
import APIErrorHandler from "./APIErrorHandler";
import { ControlledPaperTextInput } from "./form";

export type SubmitLocationMode = "new" | "update";

export type SubmitLocationData = NonNullable<
  paths["/locations/submissions"]["post"]["requestBody"]
>["content"]["application/json"];

interface SubmitLocationModalProps {
  visible: boolean;
  onClose: () => void;
  mode: SubmitLocationMode;
  /** Required when mode is 'update' */
  location?: Location;
}

const SubmitLocationModal = ({
  visible,
  onClose,
  mode,
  location,
}: SubmitLocationModalProps) => {
  const [error, setError] = useState<any>(null);
  const queryClient = useQueryClient();
  const client = useKyClient();

  const isNewLocation = mode === "new";

  const getDefaultValues = (): UnifiedLocationFormData => ({
    name: "",
    coordinates: "",
    country: "",
    rock_drop: "",
    total_height: "",
    cliff_aspect: "",
    anchor_info: "",
    access_info: "",
    notes: "",
    opened_by_name: "",
    opened_date: "",
    video_link: "",
    selectedUnit: "Meters",
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<UnifiedLocationFormData>({
    resolver: yupResolver(unifiedLocationSchema) as any,
    context: { isNewLocation },
    mode: "onBlur",
    defaultValues: getDefaultValues(),
  });

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (visible) {
      reset(getDefaultValues());
    }
  }, [visible, mode, reset]);

  const selectedUnit = watch("selectedUnit");

  const submitMutation = useMutation({
    mutationFn: async (locationData: SubmitLocationData) => {
      return client
        .POST("/locations/submissions", {
          body: locationData,
        })
        .then((res: any) => {
          if (res.error) {
            throw new Error("Failed to submit location");
          }
          return res.data;
        });
    },
    onSuccess: (response) => {
      if (response?.success) {
        onClose();
        reset();
        queryClient.invalidateQueries({ queryKey: ["submissions"] });

        if (isNewLocation) {
          router.replace("/(tabs)/profile/Profile");
        }

        Toast.show({
          type: "success",
          text1: isNewLocation
            ? "Location submitted successfully!"
            : "Details submitted successfully!",
          visibilityTime: 3000,
          position: "top",
          topOffset: 60,
        });
      } else {
        setError({ message: "Error submitting location" });
      }
    },
    onError: (error: any) => {
      setError(error);
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    const isMetric = data.selectedUnit === "Meters";

    if (isNewLocation) {
      // New location submission
      const parsedCoords = parseCoordinates(data.coordinates || "");
      if (!parsedCoords) {
        setError({
          message:
            "Invalid coordinates: Please use format: latitude, longitude (e.g., 60.140582, -2.111822)",
        });
        return;
      }

      const optionalFields: Partial<SubmitLocationData> = {};
      if (data.country) optionalFields.country = data.country.trim();
      if (data.total_height) {
        optionalFields.total_height_ft = convertToFeet(
          parseFloat(data.total_height),
          isMetric,
        );
      }
      if (data.cliff_aspect)
        optionalFields.cliff_aspect = data.cliff_aspect.trim();
      if (data.anchor_info)
        optionalFields.anchor_info = data.anchor_info.trim();
      if (data.access_info)
        optionalFields.access_info = data.access_info.trim();
      if (data.notes) optionalFields.notes = data.notes.trim();
      if (data.opened_by_name)
        optionalFields.opened_by_name = data.opened_by_name.trim();
      if (data.opened_date)
        optionalFields.opened_date = data.opened_date.trim();
      if (data.video_link) optionalFields.video_link = data.video_link.trim();

      const locationData = {
        submission_type: "new",
        name: (data.name || "").trim(),
        latitude: parsedCoords.latitude,
        longitude: parsedCoords.longitude,
        rock_drop_ft: convertToFeet(
          parseFloat(data.rock_drop || "0"),
          isMetric,
        ),
        ...optionalFields,
      } satisfies SubmitLocationData;

      await submitMutation.mutateAsync(locationData);
    } else {
      // Update existing location
      if (!location) {
        setError({ message: "No location provided for update" });
        return;
      }

      const hasUpdates =
        data.name ||
        data.rock_drop ||
        data.total_height ||
        data.cliff_aspect ||
        data.anchor_info ||
        data.access_info ||
        data.notes ||
        data.opened_by_name ||
        data.opened_date;

      if (!hasUpdates) {
        setError({
          message: "No updates provided: Please fill in at least one field",
        });
        return;
      }

      const optionalFields: Partial<SubmitLocationData> = {};
      if (data.rock_drop && !isNaN(parseFloat(data.rock_drop))) {
        optionalFields.rock_drop_ft = convertToFeet(
          parseFloat(data.rock_drop),
          isMetric,
        );
      }
      if (data.total_height && !isNaN(parseFloat(data.total_height))) {
        optionalFields.total_height_ft = convertToFeet(
          parseFloat(data.total_height),
          isMetric,
        );
      }
      if (data.cliff_aspect)
        optionalFields.cliff_aspect = data.cliff_aspect.trim();
      if (data.anchor_info)
        optionalFields.anchor_info = data.anchor_info.trim();
      if (data.access_info)
        optionalFields.access_info = data.access_info.trim();
      if (data.notes) optionalFields.notes = data.notes.trim();
      if (data.opened_by_name)
        optionalFields.opened_by_name = data.opened_by_name.trim();
      if (data.opened_date)
        optionalFields.opened_date = data.opened_date.trim();

      const submissionData = {
        submission_type: "update",
        existing_location_id: location.id,
        name: data.name?.trim() || location.name,
        country: location.country || "",
        latitude: location.latitude,
        longitude: location.longitude,
        ...optionalFields,
      } satisfies SubmitLocationData;

      await submitMutation.mutateAsync(submissionData);
    }
  });

  const handleCancel = () => {
    onClose();
    reset();
  };

  const getPlaceholder = (
    field: keyof Location | "coordinates",
    defaultPlaceholder: string,
  ) => {
    if (isNewLocation) {
      return defaultPlaceholder;
    }
    if (!location) return defaultPlaceholder;

    if (field === "coordinates") {
      return `${location.latitude}, ${location.longitude}`;
    }
    const value = location[field as keyof Location];
    return value ? String(value) : defaultPlaceholder;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.panelTitle}>
                  {isNewLocation ? "Submit New Location" : "Submit Details"}
                </Text>

                {!isNewLocation && location && (
                  <Text style={styles.subtitle}>
                    Help improve the database by submitting additional details
                    for{" "}
                    <Text style={styles.locationName}>{location?.name}</Text>
                  </Text>
                )}

                {isNewLocation && (
                  <Text style={styles.instructionText}>
                    Fields marked with * are required
                  </Text>
                )}

                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>
                    Unit: <Text style={styles.switchValue}>{selectedUnit}</Text>
                  </Text>
                  <Switch
                    value={selectedUnit === "Feet"}
                    onValueChange={(value) =>
                      setValue("selectedUnit", value ? "Feet" : "Meters")
                    }
                    trackColor={{ false: "#767577", true: "#00ABF0" }}
                    thumbColor={selectedUnit === "Feet" ? "#fff" : "#f4f3f4"}
                  />
                </View>

                <Text style={styles.panelSubtitle}>
                  {isNewLocation
                    ? "Exit Name *"
                    : "Location Name (if different)"}
                </Text>
                <ControlledPaperTextInput
                  control={control}
                  name="name"
                  style={styles.input}
                  mode="outlined"
                  placeholder={getPlaceholder("name", "Enter location name")}
                  autoCapitalize="words"
                  textColor="black"
                  activeOutlineColor="black"
                />

                {isNewLocation && (
                  <>
                    <Text style={styles.panelSubtitle}>
                      Exact Coordinates * (lat, lng)
                    </Text>
                    <ControlledPaperTextInput
                      control={control}
                      name="coordinates"
                      style={styles.input}
                      mode="outlined"
                      placeholder="e.g., 60.140582, -2.111822"
                      autoCapitalize="none"
                      textColor="black"
                      activeOutlineColor="black"
                    />

                    <Text style={styles.panelSubtitle}>Country</Text>
                    <ControlledPaperTextInput
                      control={control}
                      name="country"
                      style={styles.input}
                      mode="outlined"
                      placeholder="Enter country"
                      autoCapitalize="words"
                      textColor="black"
                      activeOutlineColor="black"
                    />
                  </>
                )}

                <Text style={styles.panelSubtitle}>
                  Rock Drop{isNewLocation ? " *" : ""} ({selectedUnit})
                </Text>
                <ControlledPaperTextInput
                  control={control}
                  name="rock_drop"
                  style={styles.input}
                  mode="outlined"
                  placeholder={getPlaceholder(
                    "rock_drop_ft",
                    `Height in ${selectedUnit.toLowerCase()}`,
                  )}
                  keyboardType="numeric"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>
                  Total Height ({selectedUnit})
                </Text>
                <ControlledPaperTextInput
                  control={control}
                  name="total_height"
                  style={styles.input}
                  mode="outlined"
                  placeholder={getPlaceholder(
                    "total_height_ft",
                    `Total height in ${selectedUnit.toLowerCase()}`,
                  )}
                  keyboardType="numeric"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>Cliff Aspect</Text>
                <ControlledPaperTextInput
                  control={control}
                  name="cliff_aspect"
                  style={styles.input}
                  mode="outlined"
                  placeholder={getPlaceholder(
                    "cliff_aspect",
                    "e.g., N, NE, E, SE, S, SW, W, NW",
                  )}
                  autoCapitalize="characters"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>Anchor Information</Text>
                <ControlledPaperTextInput
                  control={control}
                  name="anchor_info"
                  style={styles.input}
                  mode="outlined"
                  placeholder={getPlaceholder(
                    "anchor_info",
                    "Anchor type and details",
                  )}
                  autoCapitalize="sentences"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>Access Information</Text>
                <ControlledPaperTextInput
                  control={control}
                  name="access_info"
                  style={[styles.input, styles.multilineInput]}
                  mode="outlined"
                  placeholder={getPlaceholder(
                    "access_info",
                    "How to access this location...",
                  )}
                  multiline
                  numberOfLines={3}
                  autoCapitalize="sentences"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>Opened By</Text>
                <ControlledPaperTextInput
                  control={control}
                  name="opened_by_name"
                  style={styles.input}
                  mode="outlined"
                  placeholder={getPlaceholder(
                    "opened_by_name",
                    "Person who first jumped this location",
                  )}
                  autoCapitalize="words"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>Opened Date</Text>
                <ControlledPaperTextInput
                  control={control}
                  name="opened_date"
                  style={styles.input}
                  mode="outlined"
                  placeholder={getPlaceholder("opened_date", "YYYY-MM-DD")}
                  autoCapitalize="none"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>Additional Notes</Text>
                <ControlledPaperTextInput
                  control={control}
                  name="notes"
                  style={[styles.input, styles.multilineInput]}
                  mode="outlined"
                  placeholder={getPlaceholder(
                    "notes",
                    "Any additional information about this location...",
                  )}
                  multiline
                  numberOfLines={4}
                  autoCapitalize="sentences"
                  textColor="black"
                  activeOutlineColor="black"
                />

                {isNewLocation && (
                  <>
                    <Text style={styles.panelSubtitle}>Video Link</Text>
                    <ControlledPaperTextInput
                      control={control}
                      name="video_link"
                      style={styles.input}
                      mode="outlined"
                      placeholder="https://..."
                      autoCapitalize="none"
                      keyboardType="url"
                      textColor="black"
                      activeOutlineColor="black"
                    />
                  </>
                )}

                {submitMutation.isPending || isSubmitting ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator
                      animating={true}
                      color="#00ABF0"
                      size="large"
                    />
                    <Text style={styles.loadingText}>
                      {isNewLocation
                        ? "Submitting location..."
                        : "Submitting details..."}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.panelButton}
                      onPress={handleFormSubmit}
                    >
                      <Text style={styles.panelButtonTitle}>
                        {isNewLocation ? "Submit Location" : "Submit Details"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
                    >
                      <Text style={styles.panelButtonTitle}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
      <APIErrorHandler error={error} onDismiss={() => setError(null)} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  container: {
    width: "85%",
    maxWidth: 400,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 12,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  locationName: {
    fontWeight: "bold",
    color: "#00ABF0",
  },
  instructionText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 15,
    color: "#1a1a1a",
  },
  switchValue: {
    fontWeight: "600",
    color: "#00ABF0",
  },
  panelSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    marginTop: 10,
    fontWeight: "500",
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    width: "100%",
    fontSize: 15,
  },
  multilineInput: {
    height: 80,
  },
  modalFooter: {
    marginTop: 20,
    alignItems: "center",
  },
  panelButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#00ABF0",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },
  panelButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#6c757d",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
});

export default SubmitLocationModal;
