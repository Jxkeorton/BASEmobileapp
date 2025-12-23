import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useKyClient } from "../services/kyClient";
import { paths } from "../types/api";
import { LogbookJump } from "./LogbookJumpCard";

type LogbookPostBody =
  paths["/logbook"]["post"]["requestBody"]["content"]["application/json"];

interface LogbookModalProps {
  visible: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const LogbookModal = ({ visible, onClose, isLoading }: LogbookModalProps) => {
  const [location, setLocation] = useState("");
  const [exitType, setExitType] =
    useState<LogbookPostBody["exit_type"]>("Earth");
  const [delay, setDelay] = useState<number>(0);
  const [details, setDetails] = useState("");
  const [date, setDate] = useState("");
  const [showExitTypes, setShowExitTypes] = useState(false);
  const client = useKyClient();
  const queryClient = useQueryClient();

  // Valid exit types as per API validation
  const exitTypes: LogbookJump["exit_type"][] = [
    "Building",
    "Antenna",
    "Span",
    "Earth",
  ];

  // TanStack mutation for submitting jump data
  const submitJumpMutation = useMutation({
    mutationFn: async (jumpData: LogbookPostBody) => {
      const requestBody: any = {
        location_name: jumpData.location_name,
        exit_type: jumpData.exit_type ?? "Earth",
        delay_seconds: jumpData.delay_seconds ? jumpData.delay_seconds : NaN,
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
        // Invalidate and refetch logbook queries to update the UI
        queryClient.invalidateQueries({ queryKey: ["logbook"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] }); // Update jump count

        onClose();
        router.replace("/(tabs)/logbook/LogBook");

        Toast.show({
          type: "success",
          text1: "New jump logged",
          position: "top",
        });

        // Clear the form fields
        clearForm();
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to submit jump",
          text2: "Unknown error occurred",
          position: "top",
        });
      }
    },
    onError: (error: any) => {
      console.error("Submit jump error:", error);

      let errorMessage = "Network error occurred";
      let errorDetails = "";

      // Handle different types of errors
      if (error.response) {
        // API validation errors
        if (error.response.status === 400 && error.response.data?.validation) {
          errorMessage = "Validation Error";
          const validationErrors = error.response.data.validation;
          errorDetails = validationErrors
            .map((err: any) => {
              if (err.instancePath === "/exit_type") {
                return "Please select a valid exit type";
              }
              return err.message;
            })
            .join(", ");
        } else if (error.response.data?.error) {
          errorMessage = "Submission Failed";
          errorDetails = error.response.data.error;
        } else {
          errorMessage = `Request failed (${error.response.status})`;
        }
      } else if (error.message) {
        errorMessage = "Request Error";
        errorDetails = error.message;
      }

      Toast.show({
        type: "error",
        text1: errorMessage,
        text2: errorDetails,
        position: "top",
      });
    },
  });

  const clearForm = () => {
    setLocation("");
    setExitType("Earth");
    setDelay(0);
    setDetails("");
    setDate("");
  };

  const formData = {
    location_name: location,
    exit_type: exitType,
    delay_seconds: delay,
    details: details,
    jump_date: date,
  } as LogbookPostBody;

  const handleSubmit = async () => {
    // Enhanced validation
    if (!location.trim()) {
      Toast.show({
        type: "error",
        text1: "Location is required",
        position: "top",
      });
      return;
    }

    if (delay && (isNaN(delay) || delay < 0)) {
      Toast.show({
        type: "error",
        text1: "Invalid delay",
        text2: "Delay must be a positive number",
        position: "top",
      });
      return;
    }

    try {
      await submitJumpMutation.mutateAsync(formData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  const handleCancel = () => {
    onClose();

    Toast.show({
      type: "info",
      text1: "Logging jump cancelled",
      position: "top",
    });

    // Clear state
    clearForm();
  };

  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            <ScrollView>
              <Text style={styles.panelTitle}>Log a jump !</Text>

              <Text style={styles.panelSubtitle}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder="Enter location name"
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
                  {exitTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.exitTypeOption,
                        exitType === type && styles.selectedExitType,
                      ]}
                      onPress={() => {
                        if (typeof type === "string") {
                          setExitType(type);
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
                      setExitType("Earth");
                      setShowExitTypes(false);
                    }}
                  >
                    <Text style={styles.clearOptionText}>Clear selection</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.panelSubtitle}>Delay</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={delay.toString()}
                onChangeText={(text) => setDelay(Number(text) || 0)}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder="in seconds"
              />

              <Text style={styles.panelSubtitle}>Date of jump</Text>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                autoCorrect={false}
                autoCapitalize="none"
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.panelSubtitle}>Details</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={details}
                onChangeText={setDetails}
                autoCorrect={false}
                autoCapitalize="none"
                multiline={true}
                numberOfLines={4}
                placeholder="Add any additional details"
              />

              {isLoading || submitJumpMutation.isPending ? (
                <ActivityIndicator animating={true} color="#00ABF0" />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.panelButton}
                    onPress={handleSubmit}
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
