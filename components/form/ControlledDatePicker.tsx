import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  PathValue,
} from "react-hook-form";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ControlledDatePickerProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

/**
 * Formats a Date object to YYYY-MM-DD string format for API submission
 */
const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Formats a Date object for display (e.g., "Jan 24, 2026")
 */
const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Parses a YYYY-MM-DD string to a Date object
 */
const parseDateString = (dateString: string): Date | null => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export function ControlledDatePicker<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  placeholder = "Select date",
  maximumDate,
  minimumDate,
}: ControlledDatePickerProps<TFieldValues, TName>) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const currentDate = value ? parseDateString(value as string) : null;

        const handleDateChange = (
          event: DateTimePickerEvent,
          selectedDate?: Date,
        ) => {
          if (Platform.OS === "android") {
            setShowPicker(false);
          }

          if (event.type === "set" && selectedDate) {
            const formattedDate = formatDateForApi(selectedDate);
            onChange(formattedDate as PathValue<TFieldValues, TName>);
            if (Platform.OS === "ios") {
              setShowPicker(false);
            }
          } else if (event.type === "dismissed") {
            setShowPicker(false);
          }
        };

        const handleClearDate = () => {
          onChange("" as PathValue<TFieldValues, TName>);
          setShowPicker(false);
        };

        return (
          <View style={styles.container}>
            <TouchableOpacity
              style={[styles.dateButton, error && styles.dateButtonError]}
              onPress={() => setShowPicker(true)}
            >
              <Text
                style={[
                  styles.dateButtonText,
                  !currentDate && styles.placeholderText,
                ]}
              >
                {currentDate ? formatDateForDisplay(currentDate) : placeholder}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>

            {error && <Text style={styles.errorText}>{error.message}</Text>}

            {Platform.OS === "ios" ? (
              <Modal
                visible={showPicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowPicker(false)}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Select Date</Text>
                      <TouchableOpacity onPress={handleClearDate}>
                        <Text style={styles.modalClearText}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={currentDate || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      {...(maximumDate && { maximumDate })}
                      {...(minimumDate && { minimumDate })}
                      style={styles.iosPicker}
                    />
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={() => {
                        if (!currentDate) {
                          const formattedDate = formatDateForApi(new Date());
                          onChange(
                            formattedDate as PathValue<TFieldValues, TName>,
                          );
                        }
                        setShowPicker(false);
                      }}
                    >
                      <Text style={styles.confirmButtonText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            ) : (
              showPicker && (
                <DateTimePicker
                  value={currentDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  {...(maximumDate && { maximumDate })}
                  {...(minimumDate && { minimumDate })}
                />
              )
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dateButton: {
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
  dateButtonError: {
    borderColor: "#dc3545",
  },
  dateButtonText: {
    fontSize: 15,
    color: "#1a1a1a",
  },
  placeholderText: {
    color: "#999",
  },
  calendarIcon: {
    fontSize: 16,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#666",
  },
  modalClearText: {
    fontSize: 16,
    color: "#dc3545",
  },
  iosPicker: {
    height: 200,
  },
  confirmButton: {
    backgroundColor: "#00ABF0",
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
