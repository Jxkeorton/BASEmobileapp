import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";

import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Share, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ActivityIndicator, Text, TouchableRipple } from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import SavedLocationCard from "../../../components/SavedLocationCard";
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
      <ScrollView>
        <View style={styles.userInfoSection}>
          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={30} color="#ccc" />
            </View>
            <View style={{ marginLeft: 20 }}>
              <Text
                variant="titleLarge"
                style={[
                  styles.title,
                  {
                    marginTop: 15,
                    marginBottom: 5,
                  },
                ]}
              >
                {profile?.name || "No name set"}
              </Text>
              <Text variant="bodySmall" style={styles.caption}>
                @{profile.username || "No username"}
              </Text>
            </View>
          </View>

          <View style={styles.userInfoSection} />

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
                {profile.jump_number || 0}
              </Text>
              <Text variant="bodySmall" style={styles.lightText}>
                Total Base Jumps
              </Text>
            </View>
            <View style={styles.infoBox}>
              <TouchableRipple
                onPress={() => router.replace("/(tabs)/profile/EditProfile")}
                style={styles.quickAction}
              >
                <View style={styles.quickActionContent}>
                  <MaterialCommunityIcons
                    name="account-check-outline"
                    color="#fff"
                    size={22}
                  />
                  <Text style={styles.quickActionText}>Edit Profile</Text>
                </View>
              </TouchableRipple>
              <TouchableRipple
                onPress={myCustomShare}
                style={styles.quickAction}
              >
                <View style={styles.quickActionContent}>
                  <MaterialCommunityIcons
                    name="share-outline"
                    color="#fff"
                    size={22}
                  />
                  <Text style={styles.quickActionText}>Share</Text>
                </View>
              </TouchableRipple>
              <TouchableRipple
                onPress={() => router.replace("/(tabs)/profile/SubmitLocation")}
                style={styles.quickAction}
              >
                <View style={styles.quickActionContent}>
                  <MaterialCommunityIcons
                    name="map-marker-radius"
                    color="#fff"
                    size={22}
                  />
                  <Text style={styles.quickActionText}>Submit</Text>
                </View>
              </TouchableRipple>
            </View>
          </View>
        </View>

        {locationsLoading ? (
          <Text>Loading</Text>
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
              <SavedLocationCard data={savedLocations} onDelete={onDelete} />
            )}
          </>
        )}
      </ScrollView>
      <APIErrorHandler
        error={error || profileError || locationsError}
        onDismiss={() => setError(null)}
      />
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
  errorText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorDetails: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 5,
    textAlign: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "black",
  },
  infoBoxWrapper: {
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    borderBottomWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    borderTopWidth: 1,
    flexDirection: "row",
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  infoBox: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  whiteText: {
    color: "#fff",
    fontWeight: "700",
  },
  lightText: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  quickAction: {
    marginVertical: 2,
    borderRadius: 6,
  },
  quickActionContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quickActionText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
});
