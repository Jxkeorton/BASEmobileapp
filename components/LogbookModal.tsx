import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useKyClient } from "../services/kyClient";
import {
  logbookJumpSchema,
  type LogbookJumpFormData,
} from "../utils/validationSchemas";
import APIErrorHandler from "./APIErrorHandler";
import { ControlledPaperTextInput } from "./form";
import { LogbookJump } from "./LogbookJumpCard";

interface LogbookModalProps {
  visible: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const LogbookModal = ({ visible, onClose, isLoading }: LogbookModalProps) => {
  const [showExitTypes, setShowExitTypes] = useState(false);
  const [error, setError] = useState<any>(null);
  const client = useKyClient();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<LogbookJumpFormData>({
    resolver: yupResolver(logbookJumpSchema) as any,
    mode: "onBlur",
    defaultValues: {
      location_name: "",
      exit_type: "Earth",
      delay_seconds: 0,
      details: "",
      jump_date: "",
    },
  });

  const exitType = watch("exit_type");

  const validExitTypes: LogbookJump["exit_type"][] = [
    "Building",
    "Antenna",
    "Span",
    "Earth",
  ];

  const submitJumpMutation = useMutation({
    mutationFn: async (jumpData: LogbookJumpFormData) => {
      const requestBody: any = {
        location_name: jumpData.location_name,
        exit_type: jumpData.exit_type ?? "Earth",
        delay_seconds: jumpData.delay_seconds ?? 0,
        details: jumpData.details ?? "",
      };

      // Only include jump_date if it's not empty
      if (jumpData.jump_date && jumpData.jump_date.trim() !== "") {
        requestBody.jump_date = jumpData.jump_date;
      }

      const response = await client.POST("/logbook", {
        body: requestBody,
      });
      return response.response;
    },
    onSuccess: (response) => {
      if (response.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["logbook"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });

        Toast.show({
          type: "success",
          text1: "Jump logged successfully!",
          visibilityTime: 3000,
          position: "top",
          topOffset: 60,
        });

        onClose();
        router.replace("/(tabs)/logbook/LogBook");

        // Clear the form
        reset();
      } else {
        setError({ message: "Failed to submit jump" });
      }
    },
    onError: (error: any) => {
      setError(error);
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    await submitJumpMutation.mutateAsync(data);
  });

  const handleCancel = () => {
    onClose();
    reset();
  };

  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            <ScrollView>
              <Text style={styles.panelTitle}>Log a jump !</Text>

              <Text style={styles.panelSubtitle}>Location</Text>
              <ControlledPaperTextInput
                control={control}
                name="location_name"
                style={styles.input}
                mode="outlined"
                placeholder="Enter location name"
                autoCapitalize="words"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Exit Type</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowExitTypes(!showExitTypes)}
              >
                <Text
                  style={[
                    styles.dropdownText,
                    !exitType && styles.placeholderText,
                  ]}
                >
                  {exitType || "Select exit type"}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {showExitTypes ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {showExitTypes && (
                <View style={styles.exitTypesList}>
                  {validExitTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.exitTypeOption,
                        exitType === type && styles.selectedExitType,
                      ]}
                      onPress={() => {
                        if (typeof type === "string") {
                          setValue("exit_type", type);
                          setShowExitTypes(false);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.exitTypeText,
                          exitType === type && styles.selectedExitTypeText,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.exitTypeOption}
                    onPress={() => {
                      setValue("exit_type", "Earth");
                      setShowExitTypes(false);
                    }}
                  >
                    <Text style={styles.clearOptionText}>Clear selection</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.panelSubtitle}>Delay</Text>
              <ControlledPaperTextInput
                control={control}
                name="delay_seconds"
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                placeholder="in seconds"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Date of jump</Text>
              <ControlledPaperTextInput
                control={control}
                name="jump_date"
                style={styles.input}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                autoCapitalize="none"
                textColor="black"
                activeOutlineColor="black"
              />

              <Text style={styles.panelSubtitle}>Details</Text>
              <ControlledPaperTextInput
                control={control}
                name="details"
                style={[styles.input, { height: 100 }]}
                mode="outlined"
                multiline
                numberOfLines={4}
                placeholder="Add any additional details"
                autoCapitalize="sentences"
                textColor="black"
                activeOutlineColor="black"
              />

              {isLoading || submitJumpMutation.isPending || isSubmitting ? (
                <ActivityIndicator animating={true} color="#00ABF0" />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.panelButton}
                    onPress={handleFormSubmit}
                  >
                    <Text style={styles.panelButtonTitle}>Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.panelButtonTitle}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
              <APIErrorHandler error={error} onDismiss={() => setError(null)} />
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
    marginBottom: 10,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "gray",
    height: 30,
  },
  input: {
    height: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: 200,
  },
  modalFooter: {
    marginTop: 20,
    alignItems: "center",
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#00ABF0",
    alignItems: "center",
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  cancelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#A52A2A",
    alignItems: "center",
    marginVertical: 7,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: 200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#000",
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    color: "#666",
    fontSize: 12,
  },
  exitTypesList: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    marginBottom: 10,
    width: 200,
    maxHeight: 200,
  },
  exitTypeOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedExitType: {
    backgroundColor: "#00ABF0",
  },
  exitTypeText: {
    fontSize: 16,
    color: "#000",
  },
  selectedExitTypeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  clearOptionText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
});

export default LogbookModal;
