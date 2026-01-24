import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";

import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Share, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ActivityIndicator, Text, TouchableRipple } from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import SavedLocationCard from "../../../components/SavedLocationCard";
import SubmitLocationModal from "../../../components/SubmitLocationModal";
import { useAuth } from "../../../providers/SessionProvider";
import { useKyClient } from "../../../services/kyClient";
import { paths } from "../../../types/api";

type ProfileResponse =
  paths["/profile"]["get"]["responses"]["200"]["content"]["application/json"];
export type ProfileData = NonNullable<ProfileResponse["data"]>;
export type SavedLocationsArray = NonNullable<
  paths["/locations/saved"]["get"]["responses"]["200"]["content"]["application/json"]["data"]
>["saved_locations"];

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const client = useKyClient();
  const [error, setError] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    enabled: !!isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  const {
    data: savedLocationsResponse,
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["savedLocations", user?.id],
    queryFn: async () => {
      return client.GET("/locations/saved").then((res) => {
        if (res.error) {
          throw new Error("Failed to fetch saved locations");
        }
        return res.data;
      });
    },
    enabled: !!isAuthenticated && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  const unsaveLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      return client
        .DELETE("/locations/unsave", {
          body: { location_id: locationId },
        })
        .then((res) => {
          if (res.error) {
            throw new Error("Failed to unsave location");
          }
          return res.data;
        });
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["savedLocations"] });
      }
    },
    onError: (err) => {
      setError(err);
    },
  });

  const onDelete = async (locationId: number) => {
    await unsaveLocationMutation.mutateAsync(locationId);
  };

  const myCustomShare = async () => {
    try {
      await Share.share({
        message: "BASE world map, virtual logbook and more !",
      });
    } catch (error) {
      setError(error);
    }
  };

  const profile = profileResponse?.success ? profileResponse.data : undefined;
  const savedLocations = savedLocationsResponse?.success
    ? (savedLocationsResponse.data?.saved_locations ??
      ([] as SavedLocationsArray))
    : ([] as SavedLocationsArray);

  if (profileLoading) {
    return (
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.container, styles.loadingContainer]}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </LinearGradient>
    );
  }

  if (!profile) {
    return (
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.container, styles.loadingContainer]}
      >
        <Text style={styles.errorText}>Profile not found</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#00ABF0", "#0088CC", "#006699"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View style={styles.avatarPlaceholder}>
                <FontAwesome name="user" size={24} color="#00ABF0" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profile?.name || "No name set"}
                </Text>
                <Text style={styles.profileUsername}>
                  @{profile.username || "No username"}
                </Text>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {profile.jump_number || 0}
                </Text>
                <Text style={styles.statLabel}>Total BASE Jumps</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <View style={styles.actionsCard}>
            <Text style={styles.sectionLabel}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableRipple
                onPress={() => router.replace("/(tabs)/profile/EditProfile")}
                style={styles.actionButton}
                borderless
              >
                <View style={styles.actionButtonContent}>
                  <View style={styles.actionIconContainer}>
                    <MaterialCommunityIcons
                      name="account-edit"
                      color="#00ABF0"
                      size={20}
                    />
                  </View>
                  <Text style={styles.actionButtonText}>Edit Profile</Text>
                </View>
              </TouchableRipple>
              <TouchableRipple
                onPress={myCustomShare}
                style={styles.actionButton}
                borderless
              >
                <View style={styles.actionButtonContent}>
                  <View style={styles.actionIconContainer}>
                    <MaterialCommunityIcons
                      name="share-variant"
                      color="#00ABF0"
                      size={20}
                    />
                  </View>
                  <Text style={styles.actionButtonText}>Share App</Text>
                </View>
              </TouchableRipple>
              <TouchableRipple
                onPress={() => setIsModalOpen(true)}
                style={styles.actionButton}
                borderless
              >
                <View style={styles.actionButtonContent}>
                  <View style={styles.actionIconContainer}>
                    <MaterialCommunityIcons
                      name="map-marker-plus"
                      color="#00ABF0"
                      size={20}
                    />
                  </View>
                  <Text style={styles.actionButtonText}>Submit Location</Text>
                </View>
              </TouchableRipple>
            </View>
          </View>

          <View style={styles.savedSection}>
            <Text style={styles.sectionTitle}>Saved Locations</Text>
            {locationsLoading ? (
              <View style={styles.loadingSection}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingSectionText}>Loading...</Text>
              </View>
            ) : (
              <>
                {locationsError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                      Error loading saved locations
                    </Text>
                    <Text style={styles.errorDetails}>
                      {locationsError.message}
                    </Text>
                  </View>
                ) : (
                  <SavedLocationCard
                    data={savedLocations}
                    onDelete={onDelete}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>
      <APIErrorHandler
        error={error || profileError || locationsError}
        onDismiss={() => setError(null)}
      />

      <SubmitLocationModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="new"
      />
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  loadingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingSectionText: {
    marginLeft: 10,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  errorText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  errorDetails: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 6,
    textAlign: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    height: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 171, 240, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(0, 171, 240, 0.2)",
  },
  profileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  profileUsername: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  statsContainer: {
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#00ABF0",
  },
  statLabel: {
    fontSize: 10,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  actionsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 10,
  },
  actionButtonContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 171, 240, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
  },
  savedSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 4,
  },
});
