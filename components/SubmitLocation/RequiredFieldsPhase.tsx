import { Switch, Text, View } from "react-native";
import { ControlledPaperTextInput } from "../form";
import { getPlaceholder, PhaseProps, phaseStyles as styles } from "./types";

interface RequiredFieldsPhaseProps extends PhaseProps {
  onUnitChange: (unit: "Meters" | "Feet") => void;
}

const RequiredFieldsPhase = ({
  control,
  mode,
  location,
  selectedUnit,
  onUnitChange,
}: RequiredFieldsPhaseProps) => {
  const isNewLocation = mode === "new";

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>
          Unit: <Text style={styles.switchValue}>{selectedUnit}</Text>
        </Text>
        <Switch
          value={selectedUnit === "Feet"}
          onValueChange={(value) => onUnitChange(value ? "Feet" : "Meters")}
          trackColor={{ false: "#767577", true: "#00ABF0" }}
          thumbColor={selectedUnit === "Feet" ? "#fff" : "#f4f3f4"}
        />
      </View>

      <Text style={styles.panelSubtitle}>
        {isNewLocation ? "Exit Name *" : "Location Name (if different)"}
      </Text>
      <ControlledPaperTextInput
        control={control}
        name="name"
        style={styles.input}
        mode="outlined"
        placeholder={getPlaceholder(
          "name",
          "Enter location name",
          isNewLocation,
          location,
        )}
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
          isNewLocation,
          location,
        )}
        keyboardType="numeric"
        textColor="black"
        activeOutlineColor="black"
      />
    </View>
  );
};

export default RequiredFieldsPhase;
