import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Checkbox, Text } from "react-native-paper";
import FormErrorText from "./FormErrorText";

interface ControlledCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  rules?: any;
  defaultValue?: boolean;
  showError?: boolean;
  disabled?: boolean;
  color?: string;
  labelComponent?: React.ReactNode;
  onLabelPress?: () => void;
}

/**
 * Controlled Checkbox component for React Hook Form with react-native-paper
 * Perfect for terms acceptance, preferences, and multi-select options
 */
export function ControlledCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  defaultValue = false,
  showError = true,
  disabled = false,
  color = "white",
  labelComponent,
  onLabelPress,
}: ControlledCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue as any}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <View style={[styles.checkboxContainer, error && styles.errorBorder]}>
            <View style={styles.checkbox}>
              <Checkbox
                status={value ? "checked" : "unchecked"}
                onPress={() => onChange(!value)}
                disabled={disabled}
                color={color}
              />
            </View>
            {labelComponent ? (
              <View style={styles.labelContainer}>{labelComponent}</View>
            ) : label ? (
              onLabelPress ? (
                <TouchableOpacity
                  onPress={onLabelPress}
                  style={styles.labelContainer}
                >
                  <Text style={styles.label}>{label}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={styles.labelContainer}
                >
                  <Text style={styles.label}>{label}</Text>
                </TouchableOpacity>
              )
            ) : null}
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorBorder: {
    borderColor: "#d32f2f",
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
  },
  checkbox: {
    marginRight: 8,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
});
