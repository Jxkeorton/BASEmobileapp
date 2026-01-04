import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import {
  TextInput as PaperTextInput,
  TextInputProps,
} from "react-native-paper";
import FormErrorText from "./FormErrorText";

interface ControlledPaperTextInputProps<T extends FieldValues> extends Omit<
  TextInputProps,
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
 * Controlled TextInput component for React Hook Form with react-native-paper
 * Use this for Paper-themed inputs
 */
export function ControlledPaperTextInput<T extends FieldValues>({
  control,
  name,
  label = "",
  rules,
  defaultValue = "",
  showError = true,
  style,
  ...paperTextInputProps
}: ControlledPaperTextInputProps<T>) {
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
        <View>
          <PaperTextInput
            label={label}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            style={[styles.paperInput, style]}
            mode="outlined"
            {...paperTextInputProps}
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
 * Controlled Paper TextInput specifically for password fields
 */
export function ControlledPaperSecureTextInput<T extends FieldValues>({
  control,
  name,
  label = "Password",
  rules,
  defaultValue = "",
  showError = true,
  style,
  ...paperTextInputProps
}: ControlledPaperTextInputProps<T>) {
  return (
    <ControlledPaperTextInput
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
      {...paperTextInputProps}
    />
  );
}

/**
 * Controlled Paper TextInput specifically for email fields
 */
export function ControlledPaperEmailInput<T extends FieldValues>({
  control,
  name,
  label = "Email",
  rules,
  defaultValue = "",
  showError = true,
  style,
  ...paperTextInputProps
}: ControlledPaperTextInputProps<T>) {
  return (
    <ControlledPaperTextInput
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
      {...paperTextInputProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  paperInput: {
    backgroundColor: "white",
  },
});
