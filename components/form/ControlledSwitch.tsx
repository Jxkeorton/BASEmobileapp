import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Switch, Text } from "react-native-paper";
import FormErrorText from "./FormErrorText";

interface ControlledSwitchProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  rules?: any;
  defaultValue?: boolean;
  showError?: boolean;
  disabled?: boolean;
  color?: string;
  leftLabel?: boolean;
}

/**
 * Controlled Switch component for React Hook Form with react-native-paper
 * Perfect for boolean form fields like toggles and preferences
 */
export function ControlledSwitch<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  defaultValue = false,
  showError = true,
  disabled = false,
  color,
  leftLabel = true,
}: ControlledSwitchProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue as any}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <View style={styles.switchContainer}>
            {leftLabel && label && <Text style={styles.label}>{label}</Text>}
            <Switch
              value={value}
              onValueChange={onChange}
              disabled={disabled}
              {...(color && { color })}
            />
            {!leftLabel && label && <Text style={styles.label}>{label}</Text>}
          </View>
          {showError && error?.message && (
            <FormErrorText error={error.message} />
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
});
