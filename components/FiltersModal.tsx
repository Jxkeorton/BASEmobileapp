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
  visible: boolean;
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
  visible,
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
    <Modal visible={visible} onRequestClose={onClose} transparent={true}>
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
                    onPress={clearFilter}
                    style={styles.borderButton}
                  >
                    <Text style={styles.imageButtonTitle}>Clear Filter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleFormSubmit}
                    style={styles.panelButton}
                  >
                    <Text style={styles.panelButtonTitle}>Apply Filter</Text>
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
  // modal styles
  panelTitle: {
    fontSize: 27,
    height: 35,
    marginBottom: 10,
  },
  panelSubtitle: {
    fontSize: 14,
    color: "black",
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
    color: "black",
  },
  borderButton: {
    padding: 13,
    borderRadius: 10,
    borderWidth: 1, // Add a border width
    borderColor: "black", // Specify the border color
    alignItems: "center",
    marginVertical: 7,
    backgroundColor: "transparent", // Make the background transparent
  },
  imageButtonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "black",
  },
});

export default FiltersModal;
