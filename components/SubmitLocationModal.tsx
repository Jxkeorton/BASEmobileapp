import { FontAwesome } from "@expo/vector-icons";
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
import {
  AdditionalInfoPhase,
  LocationDetailsPhase,
  RequiredFieldsPhase,
  SubmissionPhase,
  SubmitLocationMode,
} from "./SubmitLocation";

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

const TOTAL_PHASES = 3;

const SubmitLocationModal = ({
  visible,
  onClose,
  mode,
  location,
}: SubmitLocationModalProps) => {
  const [error, setError] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState<SubmissionPhase>(1);
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
    trigger,
    formState: { isSubmitting },
  } = useForm<UnifiedLocationFormData>({
    resolver: yupResolver(unifiedLocationSchema) as any,
    context: { isNewLocation },
    mode: "onBlur",
    defaultValues: getDefaultValues(),
  });

  // Reset form and phase when modal opens/closes or mode changes
  useEffect(() => {
    if (visible) {
      reset(getDefaultValues());
      setCurrentPhase(1);
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
        setCurrentPhase(1);
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
    setCurrentPhase(1);
  };

  const validatePhase1 = async (): Promise<boolean> => {
    if (isNewLocation) {
      const result = await trigger(["name", "coordinates", "rock_drop"]);
      return result;
    }
    // For updates, phase 1 is always valid (fields are optional)
    return true;
  };

  const handleNext = async () => {
    if (currentPhase === 1) {
      const isValid = await validatePhase1();
      if (!isValid) return;
    }

    if (currentPhase < TOTAL_PHASES) {
      setCurrentPhase((prev) => (prev + 1) as SubmissionPhase);
    }
  };

  const handleBack = () => {
    if (currentPhase > 1) {
      setCurrentPhase((prev) => (prev - 1) as SubmissionPhase);
    }
  };

  const getPhaseTitle = (): string => {
    if (!isNewLocation) {
      return "Submit Details";
    }

    switch (currentPhase) {
      case 1:
        return "Required Information";
      case 2:
        return "Location Details";
      case 3:
        return "Additional Information";
      default:
        return "Submit Location";
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 1:
        return (
          <RequiredFieldsPhase
            control={control}
            mode={mode}
            location={location}
            selectedUnit={selectedUnit}
            onUnitChange={(unit) => setValue("selectedUnit", unit)}
          />
        );
      case 2:
        return (
          <LocationDetailsPhase
            control={control}
            mode={mode}
            location={location}
            selectedUnit={selectedUnit}
          />
        );
      case 3:
        return (
          <AdditionalInfoPhase
            control={control}
            mode={mode}
            location={location}
          />
        );
      default:
        return null;
    }
  };

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((phase) => (
        <View
          key={phase}
          style={[
            styles.progressDot,
            currentPhase >= phase && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderButtons = () => {
    if (submitMutation.isPending || isSubmitting) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} color="#00ABF0" size="large" />
          <Text style={styles.loadingText}>
            {isNewLocation ? "Submitting location..." : "Submitting details..."}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {/* Primary action buttons */}
        <View style={styles.primaryButtons}>
          {currentPhase < TOTAL_PHASES && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleFormSubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}

          {currentPhase < TOTAL_PHASES ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.buttonText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, styles.fullWidth]}
              onPress={handleFormSubmit}
            >
              <Text style={styles.buttonText}>
                {isNewLocation ? "Submit Location" : "Submit Details"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Secondary action buttons */}
        {currentPhase > 1 && (
          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
              >
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.panelTitle}>{getPhaseTitle()}</Text>

              {renderProgressIndicator()}

              {!isNewLocation && location && currentPhase === 1 && (
                <Text style={styles.subtitle}>
                  Help improve the database by submitting additional details for{" "}
                  <Text style={styles.locationName}>{location?.name}</Text>
                </Text>
              )}

              {isNewLocation && currentPhase === 1 && (
                <Text style={styles.instructionText}>
                  Fields marked with * are required
                </Text>
              )}

              <ScrollView
                style={styles.phaseScrollView}
                contentContainerStyle={styles.phaseContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {renderPhase()}
              </ScrollView>

              {renderButtons()}
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
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1a1a1a",
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
  },
  progressDotActive: {
    backgroundColor: "#00ABF0",
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
  phaseScrollView: {
    maxHeight: 300,
  },
  phaseContent: {
    paddingBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  primaryButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  secondaryButtons: {
    marginTop: 8,
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#00ABF0",
    alignItems: "center",
  },
  nextButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#6c757d",
    alignItems: "center",
  },
  backButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
    alignItems: "center",
  },
  fullWidth: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
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
