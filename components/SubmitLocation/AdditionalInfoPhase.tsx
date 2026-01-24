import { Text, View } from "react-native";
import { ControlledPaperTextInput } from "../form";
import { getPlaceholder, PhaseProps, phaseStyles as styles } from "./types";

const AdditionalInfoPhase = ({
  control,
  mode,
  location,
}: Omit<PhaseProps, "selectedUnit">) => {
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
          "Person who first jumped this location",
          isNewLocation,
          location,
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
        placeholder={getPlaceholder(
          "opened_date",
          "YYYY-MM-DD",
          isNewLocation,
          location,
        )}
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
          isNewLocation,
          location,
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
    </View>
  );
};

export default AdditionalInfoPhase;
