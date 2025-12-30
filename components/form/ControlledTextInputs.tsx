import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  View,
} from "react-native";
import FormErrorText from "./FormErrorText";

interface ControlledTextInputProps<T extends FieldValues> extends Omit<
  RNTextInputProps,
  "value" | "onChangeText"
> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  rules?: any;
  defaultValue?: string;
  showError?: boolean;
}

/**
 * Controlled TextInput component for React Hook Form with React Native
 * For Paper-themed inputs, use ControlledPaperTextInput instead
 */
export function ControlledTextInput<T extends FieldValues>({
  control,
  name,
  label = "",
  rules,
  defaultValue = "",
  showError = true,
  style,
  ...textInputProps
}: ControlledTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      defaultValue={defaultValue as any}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          <RNTextInput
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder={label}
            style={[styles.textInput, error && styles.textInputError, style]}
            {...textInputProps}
          />
          {showError && error?.message && (
            <FormErrorText error={error.message} />
          )}
        </View>
      )}
    />
  );
}

/**
 * Controlled TextInput specifically for password fields
 * Includes built-in secure text entry
 */
export function ControlledSecureTextInput<T extends FieldValues>({
  control,
  name,
  label = "Password",
  rules,
  defaultValue = "",
  showError = true,
  style,
  ...textInputProps
}: ControlledTextInputProps<T>) {
  return (
    <ControlledTextInput
      control={control}
      name={name}
      label={label}
      rules={rules}
      defaultValue={defaultValue}
      showError={showError}
      secureTextEntry
      autoCapitalize="none"
      autoCorrect={false}
      style={style}
      {...textInputProps}
    />
  );
}

/**
 * Controlled TextInput specifically for email fields
 * Includes proper keyboard type and auto-capitalization settings
 */
export function ControlledEmailInput<T extends FieldValues>({
  control,
  name,
  label = "Email",
  rules,
  defaultValue = "",
  showError = true,
  style,
  ...textInputProps
}: ControlledTextInputProps<T>) {
  return (
    <ControlledTextInput
      control={control}
      name={name}
      label={label}
      rules={rules}
      defaultValue={defaultValue}
      showError={showError}
      keyboardType="email-address"
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="email"
      style={style}
      {...textInputProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  textInput: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textInputError: {
    borderColor: "#d32f2f",
    borderWidth: 1,
  },
});
