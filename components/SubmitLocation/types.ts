import { Control } from "react-hook-form";
import { StyleSheet } from "react-native";
import { Location } from "../../app/(tabs)/map/Map";
import { UnifiedLocationFormData } from "../../utils/validationSchemas";

export type SubmitLocationMode = "new" | "update";

export type SubmissionPhase = 1 | 2 | 3;

export interface PhaseProps {
  control: Control<UnifiedLocationFormData>;
  mode: SubmitLocationMode;
  location: Location | undefined;
  selectedUnit: string;
}

export const getPlaceholder = (
  field: keyof Location | "coordinates",
  defaultPlaceholder: string,
  isNewLocation: boolean,
  location?: Location,
): string => {
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

export const phaseStyles = StyleSheet.create({
  container: {
    flex: 1,
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
});
