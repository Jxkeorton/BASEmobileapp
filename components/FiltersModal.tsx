import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import {
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { filterSchema, type FilterFormData } from "../utils/validationSchemas";
import { ControlledPaperTextInput } from "./form";

interface FiltersModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  onApplyFilter: (
    minRockDrop: string,
    maxRockDrop: string,
    unknownRockdrop: boolean,
  ) => void;
  minRockDrop: string;
  maxRockDrop: string;
}

const FiltersModal = ({
  isModalOpen,
  onClose,
  onApplyFilter,
  minRockDrop,
  maxRockDrop,
}: FiltersModalProps) => {
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<FilterFormData>({
      resolver: yupResolver(filterSchema) as any,
      mode: "onBlur",
      defaultValues: {
        minRockDrop: minRockDrop,
        maxRockDrop: maxRockDrop,
        unknownRockdrop: false,
      },
    });

  const unknownRockdrop = watch("unknownRockdrop");

  const clearFilter = () => {
    reset({
      minRockDrop: "",
      maxRockDrop: "",
      unknownRockdrop: false,
    });

    onApplyFilter("", "", false);
    onClose();

    Toast.show({
      type: "info",
      text1: "Filter cleared",
      visibilityTime: 3000,
      position: "top",
      topOffset: 60,
    });
  };

  const handleFormSubmit = handleSubmit((data) => {
    onClose();
    onApplyFilter(
      data.minRockDrop || "",
      data.maxRockDrop || "",
      data.unknownRockdrop || false,
    );
    Toast.show({
      type: "success",
      text1: "Filter applied",
      visibilityTime: 3000,
      position: "top",
      topOffset: 60,
    });
  });

  return (
    <Modal visible={isModalOpen} onRequestClose={onClose} transparent={true}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
              <ScrollView>
                <Text style={styles.panelTitle}>Filter Pins</Text>
                <Text style={styles.panelSubtitle}>Min Rock Drop: </Text>
                <ControlledPaperTextInput
                  control={control}
                  name="minRockDrop"
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="Minimum height"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>Max Rock Drop: </Text>
                <ControlledPaperTextInput
                  control={control}
                  name="maxRockDrop"
                  style={styles.input}
                  mode="outlined"
                  keyboardType="numeric"
                  placeholder="Maximum height"
                  textColor="black"
                  activeOutlineColor="black"
                />

                <Text style={styles.panelSubtitle}>
                  Remove Unknown Rockdrops{" "}
                </Text>
                <Switch
                  value={unknownRockdrop ?? false}
                  onValueChange={(value) => setValue("unknownRockdrop", value)}
                  trackColor={{ false: "#767577", true: "#00ABF0" }}
                  thumbColor={unknownRockdrop ? "#fff" : "#f4f3f4"}
                />

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={handleFormSubmit}
                    style={styles.panelButton}
                  >
                    <Text style={styles.panelButtonTitle}>Apply Filter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={clearFilter}
                    style={styles.clearButton}
                  >
                    <Text style={styles.clearButtonTitle}>Clear Filter</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  clearButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
    backgroundColor: "#6c757d",
  },
  clearButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default FiltersModal;
