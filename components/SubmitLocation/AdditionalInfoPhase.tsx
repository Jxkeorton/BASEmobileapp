import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ControlledDatePicker, ControlledPaperTextInput } from "../form";
import {
  AdditionalInfoPhaseProps,
  getPlaceholder,
  phaseStyles as styles,
} from "./types";

const AdditionalInfoPhase = ({
  control,
  mode,
  location,
  images,
  onPickImages,
  isSubmitting,
}: AdditionalInfoPhaseProps) => {
  const isNewLocation = mode === "new";

  return (
    <View style={styles.container}>
      <Text style={styles.panelSubtitle}>Access Information</Text>
      <ControlledPaperTextInput
        control={control}
        name="access_info"
        style={[styles.input, styles.multilineInput]}
        mode="outlined"
        placeholder={getPlaceholder(
          "access_info",
          "How to access this location...",
          isNewLocation,
          location,
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
          "Opened by...",
          isNewLocation,
          location,
        )}
        autoCapitalize="words"
        textColor="black"
        activeOutlineColor="black"
      />

      <Text style={styles.panelSubtitle}>Opened Date</Text>
      <ControlledDatePicker
        control={control}
        name="opened_date"
        placeholder="Select date"
        maximumDate={new Date()}
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

      <TouchableOpacity
        style={localStyles.imagePickerButton}
        onPress={onPickImages}
        disabled={isSubmitting}
        activeOpacity={0.7}
      >
        <FontAwesome name="camera" size={20} color="#00ABF0" />
        <Text style={localStyles.imagePickerText}>
          {images.length > 0
            ? `${images.length} image${images.length > 1 ? "s" : ""} selected`
            : "Add photos (up to 5)"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const localStyles = StyleSheet.create({
  imagePickerButton: {
    borderWidth: 1.5,
    borderColor: "#00ABF0",
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    width: "100%",
    backgroundColor: "#f0f9ff",
    marginTop: 8,
  },
  imagePickerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#00ABF0",
  },
});

export default AdditionalInfoPhase;
