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
import LinearGradient from "react-native-linear-gradient";
import {
  ActivityIndicator,
  PaperProvider,
  Portal,
  Text,
} from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import LogbookEntryCard from "../../../components/LogbookEntryCard";
import LogbookEntryModal from "../../../components/LogbookEntryModal";
import { useAuth } from "../../../providers/SessionProvider";
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
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  const profile = profileResponse?.success
    ? profileResponse.data
    : ({} as ProfileData);

  return (
    <PaperProvider>
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <ScrollView>
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
                      borderRightColor: "rgba(255, 255, 255, 0.2)",
                      borderRightWidth: 1,
                    },
                  ]}
                >
                  <Text variant="titleLarge" style={styles.whiteText}>
                    {profile?.jump_number || 0}
                  </Text>
                  <Text variant="bodySmall" style={styles.lightWhiteText}>
                    Total Base Jumps
                  </Text>
                </View>
                <View style={styles.infoBox}>
                  <TouchableHighlight
                    onPress={showModal}
                    underlayColor="rgba(255, 255, 255, 0.2)"
                    disabled={loading}
                    style={styles.addButton}
                  >
                    <View style={styles.addButtonContent}>
                      <FontAwesome
                        name="plus"
                        size={18}
                        color="#00ABF0"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.addButtonText}>Log Jump</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              </View>

              <LogbookEntryCard jumpNumber={profile?.jump_number || 0} />
              <APIErrorHandler error={profileError} />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </LinearGradient>
    </PaperProvider>
  );
};

export default LogBook;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBoxWrapper: {
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    borderBottomWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    borderTopWidth: 1,
    flexDirection: "row",
    height: 85,
    marginTop: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  infoBox: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "#00ABF0",
    fontSize: 16,
    fontWeight: "600",
  },
  whiteText: {
    color: "#fff",
    fontWeight: "600",
  },
  lightWhiteText: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
});
