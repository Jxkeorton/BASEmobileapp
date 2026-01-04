import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, PaperProvider, Switch } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../../../components/APIErrorHandler";
import { ControlledPaperTextInput } from "../../../components/form";
import { useKyClient } from "../../../services/kyClient";
import { paths } from "../../../types/api";
import { convertToFeet } from "../../../utils/unitConversions";
import {
  parseCoordinates,
  submitLocationSchema,
  type SubmitLocationFormData,
} from "../../../utils/validationSchemas";

export type SubmitLocationData = NonNullable<
  paths["/locations/submissions"]["post"]["requestBody"]
>["content"]["application/json"];

const SubmitLocation = () => {
  const [error, setError] = useState<any>(null);
  const queryClient = useQueryClient();
  const client = useKyClient();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<SubmitLocationFormData>({
    resolver: yupResolver(submitLocationSchema) as any,
    mode: "onBlur",
    defaultValues: {
      name: "",
      country: "",
      coordinates: "",
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
    },
  });

  const selectedUnit = watch("selectedUnit");

  const submitLocationMutation = useMutation({
    mutationFn: async (locationData: SubmitLocationData) => {
      return client
        .POST("/locations/submissions", {
          body: locationData,
        })
        .then((res) => {
          if (res.error) {
            throw new Error("Failed to submit location");
          }
          return res.data;
        });
    },
    onSuccess: () => {
      router.replace("/(tabs)/profile/Profile");
      Toast.show({
        type: "success",
        text1: "Location submitted successfully",
        position: "top",
        visibilityTime: 0,
      });
      reset();
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
    onError: (error: any) => {
      setError(error);
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    const parsedCoords = parseCoordinates(data.coordinates);
    if (!parsedCoords) {
      setError({
        message:
          "Invalid coordinates: Please use format: latitude, longitude (e.g., 60.140582, -2.111822)",
      });
      return;
    }

    const isMetric = data.selectedUnit === "Meters";

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
    if (data.anchor_info) optionalFields.anchor_info = data.anchor_info.trim();
    if (data.access_info) optionalFields.access_info = data.access_info.trim();
    if (data.notes) optionalFields.notes = data.notes.trim();
    if (data.opened_by_name)
      optionalFields.opened_by_name = data.opened_by_name.trim();
    if (data.opened_date) optionalFields.opened_date = data.opened_date.trim();
    if (data.video_link) optionalFields.video_link = data.video_link.trim();

    const locationData = {
      submission_type: "new",
      name: data.name.trim(),
      latitude: parsedCoords.latitude,
      longitude: parsedCoords.longitude,
      rock_drop_ft: convertToFeet(parseFloat(data.rock_drop), isMetric),
      ...optionalFields,
    } satisfies SubmitLocationData;

    await submitLocationMutation.mutateAsync(locationData);
  });

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.instructionText}>
            Fields marked with * must be filled in
          </Text>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              <Text style={styles.bold}>Unit: </Text>
              {selectedUnit}
            </Text>
            <Switch
              value={selectedUnit === "Feet"}
              color="#00ABF0"
              onValueChange={(value) =>
                setValue("selectedUnit", value ? "Feet" : "Meters")
              }
            />
          </View>

          <ControlledPaperTextInput
            control={control}
            name="name"
            label="Exit Name *"
            style={styles.textInput}
            mode="outlined"
            autoCapitalize="words"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="coordinates"
            label="Exact Coordinates * (lat, lng)"
            style={styles.textInput}
            mode="outlined"
            autoCapitalize="none"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="rock_drop"
            label={`Rock Drop * (${selectedUnit})`}
            style={styles.textInput}
            mode="outlined"
            keyboardType="numeric"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="total_height"
            label={`Total Height (${selectedUnit})`}
            style={styles.textInput}
            mode="outlined"
            keyboardType="numeric"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="country"
            label="Country"
            style={styles.textInput}
            mode="outlined"
            autoCapitalize="words"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="cliff_aspect"
            label="Cliff Aspect (N, NE, E, SE, S, SW, W, NW)"
            style={styles.textInput}
            mode="outlined"
            autoCapitalize="characters"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="anchor_info"
            label="Anchor Info"
            style={styles.textInput}
            mode="outlined"
            autoCapitalize="sentences"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="access_info"
            label="Access Information"
            style={[styles.textInput, styles.multilineInput]}
            mode="outlined"
            autoCapitalize="sentences"
            multiline
            numberOfLines={3}
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="notes"
            label="Additional Notes"
            style={[styles.textInput, styles.multilineInput]}
            mode="outlined"
            autoCapitalize="sentences"
            multiline
            numberOfLines={3}
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="opened_by_name"
            label="Opened By"
            style={styles.textInput}
            mode="outlined"
            autoCapitalize="words"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="opened_date"
            label="Opened Date (YYYY-MM-DD)"
            style={styles.textInput}
            mode="outlined"
            autoCapitalize="none"
            textColor="black"
            activeOutlineColor="black"
          />

          <ControlledPaperTextInput
            control={control}
            name="video_link"
            label="Video Link"
            style={styles.textInput}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="url"
            textColor="black"
            activeOutlineColor="black"
          />

          <View style={styles.buttonContainer}>
            {submitLocationMutation.isPending || isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00ABF0" />
                <Text style={styles.loadingText}>Submitting location...</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleFormSubmit}
                style={styles.commandButton}
                disabled={isSubmitting}
              >
                <Text style={styles.panelButtonTitle}>Submit Location</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <APIErrorHandler error={error} onDismiss={() => setError(null)} />
    </PaperProvider>
  );
};

export default SubmitLocation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  instructionText: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  textInput: {
    marginVertical: 4,
    backgroundColor: "#fff",
  },
  multilineInput: {
    minHeight: 100,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  commandButton: {
    borderRadius: 10,
    backgroundColor: "#00ABF0",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    width: "100%",
    height: 50,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  switchText: {
    fontSize: 16,
    marginRight: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});
