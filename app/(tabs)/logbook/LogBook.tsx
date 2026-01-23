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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View>
              <Portal>
                <LogbookEntryModal
                  visible={visible}
                  onClose={hideModal}
                  isLoading={loading}
                />
              </Portal>

              <View style={styles.statsCard}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {profile?.jump_number || 0}
                    </Text>
                    <Text style={styles.statLabel}>Total Jumps</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.actionItem}>
                    <TouchableHighlight
                      onPress={showModal}
                      underlayColor="rgba(0, 171, 240, 0.1)"
                      disabled={loading}
                      style={styles.addButton}
                    >
                      <View style={styles.addButtonContent}>
                        <View style={styles.addIconContainer}>
                          <FontAwesome name="plus" size={16} color="#fff" />
                        </View>
                        <Text style={styles.addButtonText}>Log Jump</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>

              <View style={styles.entriesSection}>
                <LogbookEntryCard jumpNumber={profile?.jump_number || 0} />
              </View>
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
  scrollContent: {
    paddingBottom: 100,
  },
  statsCard: {
    backgroundColor: "#fff",
    padding: 20,
    height: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#00ABF0",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: "#f0f0f0",
  },
  actionItem: {
    flex: 1,
    alignItems: "center",
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00ABF0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  addButtonText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "700",
  },
  entriesSection: {
    marginBottom: 16,
  },
});
