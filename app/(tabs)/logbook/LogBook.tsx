import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  ActivityIndicator,
  PaperProvider,
  Portal,
  Text,
} from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import LogbookEntryCard from "../../../components/LogbookEntryCard";
import LogbookEntryModal from "../../../components/LogbookEntryModal";
import { useAuth } from "../../../providers/AuthProvider";
import { useKyClient } from "../../../services/kyClient";
import type { ProfileData } from "../profile/Profile";

const LogBook = () => {
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const client = useKyClient();

  const { user, loading } = useAuth();

  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      return client.GET("/profile").then((res) => {
        if (res.error) {
          throw new Error("Failed to fetch profile");
        }

        return res.data;
      });
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  if (profileLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const profile = profileResponse?.success
    ? profileResponse.data
    : ({} as ProfileData);

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View>
            <Portal>
              <LogbookEntryModal
                visible={visible}
                onClose={hideModal}
                isLoading={loading}
              />
            </Portal>

            <View style={styles.infoBoxWrapper}>
              <View
                style={[
                  styles.infoBox,
                  {
                    borderRightColor: "#dddddd",
                    borderRightWidth: 1,
                  },
                ]}
              >
                <Text variant="titleLarge">{profile?.jump_number || 0}</Text>
                <Text variant="bodySmall">Total Base Jumps</Text>
              </View>
              <View style={styles.infoBox}>
                <TouchableHighlight
                  onPress={showModal}
                  underlayColor="#DDDDDD"
                  disabled={loading}
                >
                  <FontAwesome
                    name="plus"
                    size={30}
                    color={loading ? "#ccc" : "#000"}
                  />
                </TouchableHighlight>
              </View>
            </View>

            <LogbookEntryCard jumpNumber={profile?.jump_number || 0} />
            <APIErrorHandler error={profileError} />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </PaperProvider>
  );
};

export default LogBook;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  infoBoxWrapper: {
    borderBottomColor: "#dddddd",
    borderBottomWidth: 1,
    borderTopColor: "#dddddd",
    borderTopWidth: 1,
    flexDirection: "row",
    height: 100,
    marginTop: 20,
  },
  infoBox: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
});
