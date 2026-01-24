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
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { useAuth } from "../providers/SessionProvider";
import { useKyClient } from "../services/kyClient";
import {
  logbookJumpSchema,
  type LogbookJumpFormData,
} from "../utils/validationSchemas";
import APIErrorHandler from "./APIErrorHandler";
import { ControlledDatePicker, ControlledPaperTextInput } from "./form";
import { LogbookJump } from "./LogbookEntryCard";

interface LogbookEntryModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const LogbookEntryModal = ({
  isModalOpen,
  onClose,
  isLoading,
}: LogbookEntryModalProps) => {
  const [showExitTypes, setShowExitTypes] = useState(false);
  const [error, setError] = useState<any>(null);
  const client = useKyClient();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const updateProfileMutation = useUpdateProfile();

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
    onSuccess: async (response) => {
      if (response.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["logbook"] });

        // Increment jump_number in profile
        const currentProfile = queryClient.getQueryData(["profile", user?.id]);
        if (
          currentProfile &&
          (currentProfile as any).data?.jump_number !== undefined
        ) {
          const currentJumpNumber = (currentProfile as any).data.jump_number;
          await updateProfileMutation.mutateAsync({
            jump_number: currentJumpNumber + 1,
          });
        }

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
    <Modal visible={isModalOpen} transparent={true}>
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
              <ControlledDatePicker
                control={control}
                name="jump_date"
                placeholder="Select jump date"
                maximumDate={new Date()}
              />

              <Text style={styles.panelSubtitle}>Details</Text>
              <ControlledPaperTextInput
                control={control}
                name="details"
                style={[styles.input, { height: 70 }]}
                mode="outlined"
                multiline
                numberOfLines={3}
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
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#1a1a1a",
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
  modalFooter: {
    marginTop: 20,
    alignItems: "center",
  },
  panelButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#00ABF0",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    width: "100%",
  },
  panelButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  cancelButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#6c757d",
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 11,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    height: 42,
  },
  dropdownText: {
    fontSize: 15,
    color: "#1a1a1a",
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    color: "#666",
    fontSize: 10,
  },
  exitTypesList: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#fff",
    marginBottom: 14,
    width: "100%",
    maxHeight: 180,
  },
  exitTypeOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedExitType: {
    backgroundColor: "#00ABF0",
  },
  exitTypeText: {
    fontSize: 15,
    color: "#1a1a1a",
  },
  selectedExitTypeText: {
    color: "#fff",
    fontWeight: "600",
  },
  clearOptionText: {
    fontSize: 15,
    color: "#666",
    fontStyle: "italic",
  },
});

export default LogbookEntryModal;
