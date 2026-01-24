import { FontAwesome } from "@expo/vector-icons";
import { StyleSheet, TextInput, View } from "react-native";

type SearchBoxProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export const SearchBox = ({ value, onChangeText }: SearchBoxProps) => {
  return (
    <View style={styles.searchBox}>
      <FontAwesome
        name="search"
        size={18}
        color="#666"
        style={styles.searchIcon}
      />
      <TextInput
        placeholder="Search here"
        placeholderTextColor="#000"
        autoCapitalize="none"
        style={styles.searchInput}
        onChangeText={onChangeText}
        value={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    position: "absolute",
    backgroundColor: "#fff",
    right: 10,
    width: "80%",
    alignSelf: "center",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 10,
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1100,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    fontSize: 16,
  },
});
