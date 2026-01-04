import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { SubmitLocationData } from "../app/(tabs)/profile/SubmitLocation";
import { useKyClient } from "../services/kyClient";
import {
  submitDetailsSchema,
  type SubmitDetailsFormData,
} from "../utils/validationSchemas";
import APIErrorHandler from "./APIErrorHandler";
import { ControlledPaperTextInput } from "./form";

interface SubmitDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  location: Location;
}

const SubmitDetailsModal = ({
  visible,
  onClose,
  location,
}: SubmitDetailsModalProps) => {
  const [error, setError] = useState<any>(null);
  const queryClient = useQueryClient();
  const client = useKyClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SubmitDetailsFormData>({
    resolver: yupResolver(submitDetailsSchema) as any,
    mode: "onBlur",
    defaultValues: {
      newLocationName: "",
      exitType: "",
      rockDropHeight: "",
      totalHeight: "",
      cliffAspect: "",
      anchorInfo: "",
      accessInfo: "",
      notes: "",
      openedByName: "",
      openedDate: "",
    },
  });

  const submitUpdateMutation = useMutation({
    mutationFn: async (submissionData: SubmitLocationData) => {
      return client
        .POST("/locations/submissions", {
          body: submissionData,
        })
        .then((res: any) => {
          if (res.error) {
            throw new Error("Failed to submit location");
          }
          return res.data;
        });
    },
    onSuccess: (response) => {
      if (response.success) {
        onClose();
        reset();
        queryClient.invalidateQueries({ queryKey: ["submissions"] });

        Toast.show({
          type: "success",
          text1: "Details submitted successfully!",
          visibilityTime: 3000,
          position: "top",
          topOffset: 60,
        });
      } else {
        setError({ message: "Error submitting details" });
        reset();
        onClose();
      }
    },
    onError: (error: any) => {
      setError(error);
      reset();
      onClose();
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    const hasUpdates =
      data.newLocationName ||
      data.exitType ||
      data.rockDropHeight ||
      data.totalHeight ||
      data.cliffAspect ||
      data.anchorInfo ||
      data.accessInfo ||
      data.notes ||
      data.openedByName ||
      data.openedDate;

    if (!hasUpdates) {
      setError({
        message: "No updates provided: Please fill in at least one field",
      });
      onClose();
      reset();
      return;
    }

    const optionalFields: Partial<SubmitLocationData> = {};
    if (data.rockDropHeight && !isNaN(parseInt(data.rockDropHeight))) {
      optionalFields.rock_drop_ft = parseInt(data.rockDropHeight);
    }
    if (data.totalHeight && !isNaN(parseInt(data.totalHeight))) {
      optionalFields.total_height_ft = parseInt(data.totalHeight);
    }
    if (data.cliffAspect) optionalFields.cliff_aspect = data.cliffAspect.trim();
    if (data.anchorInfo) optionalFields.anchor_info = data.anchorInfo.trim();
    if (data.accessInfo) optionalFields.access_info = data.accessInfo.trim();
    if (data.notes) optionalFields.notes = data.notes.trim();
    if (data.openedByName)
      optionalFields.opened_by_name = data.openedByName.trim();
    if (data.openedDate) optionalFields.opened_date = data.openedDate.trim();

    const submissionData = {
      submission_type: "update",
      existing_location_id: location.id,
      name: data.newLocationName || location.name,
      country: location.country || "",
      latitude: location.latitude,
      longitude: location.longitude,
      ...optionalFields,
    } satisfies SubmitLocationData;

    await submitUpdateMutation.mutateAsync(submissionData);
  });

  const handleCancel = () => {
    onClose();
    reset();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.panelTitle}>Submit Details</Text>
              <Text style={styles.subtitle}>
                Help improve the database by submitting additional details for{" "}
                <Text style={styles.locationName}>{location?.name}</Text>
              </Text>

              <Text style={styles.panelSubtitle}>
                Location Name (if different)
              </Text>
              <ControlledPaperTextInput
                control={control}
                name="newLocationName"
                style={styles.input}
                mode="outlined"
                placeholder={location?.name}
                autoCapitalize="words"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Exit Type / Object Type</Text>
              <ControlledPaperTextInput
                control={control}
                name="exitType"
                style={styles.input}
                mode="outlined"
                placeholder="e.g., Building, Antenna, Span, Earth, Cliff"
                autoCapitalize="words"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Rock Drop Height (feet)</Text>
              <ControlledPaperTextInput
                control={control}
                name="rockDropHeight"
                style={styles.input}
                mode="outlined"
                placeholder="Height in feet"
                keyboardType="numeric"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Total Height (feet)</Text>
              <ControlledPaperTextInput
                control={control}
                name="totalHeight"
                style={styles.input}
                mode="outlined"
                placeholder="Total height in feet"
                keyboardType="numeric"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Cliff Aspect</Text>
              <ControlledPaperTextInput
                control={control}
                name="cliffAspect"
                style={styles.input}
                mode="outlined"
                placeholder="e.g., N, NE, E, SE, S, SW, W, NW"
                autoCapitalize="characters"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Anchor Information</Text>
              <ControlledPaperTextInput
                control={control}
                name="anchorInfo"
                style={styles.input}
                mode="outlined"
                placeholder="Anchor type and details"
                autoCapitalize="sentences"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Access Information</Text>
              <ControlledPaperTextInput
                control={control}
                name="accessInfo"
                style={[styles.input, { height: 80 }]}
                mode="outlined"
                placeholder="How to access this location..."
                multiline
                numberOfLines={3}
                autoCapitalize="sentences"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Opened By</Text>
              <ControlledPaperTextInput
                control={control}
                name="openedByName"
                style={styles.input}
                mode="outlined"
                placeholder="Person who first jumped this location"
                autoCapitalize="words"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Opened Date</Text>
              <ControlledPaperTextInput
                control={control}
                name="openedDate"
                style={styles.input}
                mode="outlined"
                placeholder="Date first jumped (e.g., 2023-05-15)"
                autoCapitalize="none"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Additional Notes</Text>
              <ControlledPaperTextInput
                control={control}
                name="notes"
                style={[styles.input, { height: 100 }]}
                mode="outlined"
                placeholder="Any additional information about this location..."
                multiline
                numberOfLines={4}
                autoCapitalize="sentences"
                textColor="black"
                activeOutlineColor="black"
              />

              {submitUpdateMutation.isPending || isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    animating={true}
                    color="#00ABF0"
                    size="large"
                  />
                  <Text style={styles.loadingText}>Submitting details...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleFormSubmit}
                  >
                    <Text style={styles.buttonText}>Submit Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
        <APIErrorHandler error={error} onDismiss={() => setError(null)} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  container: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  locationName: {
    fontWeight: "bold",
    color: "#00ABF0",
  },
  panelSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  submitButton: {
    backgroundColor: "#00ABF0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: "#A52A2A",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

export default SubmitDetailsModal;
