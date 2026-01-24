import { Text, View } from "react-native";
import { ControlledPaperTextInput } from "../form";
import { getPlaceholder, PhaseProps, phaseStyles as styles } from "./types";

const LocationDetailsPhase = ({
  control,
  mode,
  location,
  selectedUnit,
}: PhaseProps) => {
  const isNewLocation = mode === "new";

  return (
    <View style={styles.container}>
      {isNewLocation && (
        <>
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

      <Text style={styles.panelSubtitle}>Total Height ({selectedUnit})</Text>
      <ControlledPaperTextInput
        control={control}
        name="total_height"
        style={styles.input}
        mode="outlined"
        placeholder={getPlaceholder(
          "total_height_ft",
          `Total height in ${selectedUnit.toLowerCase()}`,
          isNewLocation,
          location,
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
          isNewLocation,
          location,
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
          isNewLocation,
          location,
        )}
        autoCapitalize="sentences"
        textColor="black"
        activeOutlineColor="black"
      />
    </View>
  );
};

export default LocationDetailsPhase;
