import React from "react";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";

interface FormErrorTextProps {
  error?: string;
  style?: any;
}

/**
 * Displays form validation error messages
 * Consistent styling across all form fields
 */
const FormErrorText: React.FC<FormErrorTextProps> = ({ error, style }) => {
  if (!error) return null;

  return <Text style={[styles.errorText, style]}>{error}</Text>;
};

const styles = StyleSheet.create({
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormErrorText;
