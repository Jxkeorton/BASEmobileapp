import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Text, TouchableRipple } from "react-native-paper";
import Toast from "react-native-toast-message";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import SavedLocationsCard from "../../../components/SavedLocationsCard";
import { useAuth } from "../../../providers/AuthProvider";
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

  // Get profile data
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

  // Get saved locations
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

  // Unsave location mutation
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
        Toast.show({
          type: "info",
          text1: "Location unsaved from profile",
          position: "top",
        });
      }
    },
    onError: (error) => {
      console.error("Unsave location error:", error);
      Toast.show({
        type: "error",
        text1: "Error could not delete location",
        position: "top",
      });
    },
  });

  const onDelete = async (locationId: number) => {
    try {
      await unsaveLocationMutation.mutateAsync(locationId);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      console.error("Unsave location failed");
    }
  };

  const myCustomShare = async () => {
    try {
      await Share.share({
        message: "BASE world map, virtual logbook and more !",
      });
    } catch (error) {
      alert((error as Error)?.message || "An unknown error occurred");
    }
  };

  // Extract profile data
  const profile = profileResponse?.success ? profileResponse.data : undefined;
  const savedLocations = savedLocationsResponse?.success
    ? (savedLocationsResponse.data?.saved_locations ??
      ([] as SavedLocationsArray))
    : ([] as SavedLocationsArray);

  if (profileLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00ABF0" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (profileError) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Error loading profile</Text>
        <Text style={styles.errorDetails}>{profileError.message}</Text>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>Profile not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
                  borderRightColor: "#dddddd",
                  borderRightWidth: 1,
                },
              ]}
            >
              <Text variant="titleLarge">{profile.jump_number || 0}</Text>
              <Text variant="bodySmall">Total Base Jumps</Text>
            </View>
          </View>

          <View style={styles.menuWrapper}>
            <TouchableRipple
              onPress={() => router.push("/(tabs)/profile/EditProfile")}
            >
              <View style={styles.menuItem}>
                <Icon name="account-check-outline" color="#777777" size={25} />
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple onPress={myCustomShare}>
              <View style={styles.menuItem}>
                <Icon name="share-outline" color="#777777" size={25} />
                <Text style={styles.menuItemText}>Tell Your Friends</Text>
              </View>
            </TouchableRipple>
            <TouchableRipple
              onPress={() => router.push("/(tabs)/profile/SubmitLocation")}
            >
              <View style={styles.menuItem}>
                <Icon name="map-marker-radius" color="#777777" size={25} />
                <Text style={styles.menuItemText}>Submit A Location</Text>
              </View>
            </TouchableRipple>
          </View>
        </View>

        {locationsLoading ? (
          <p>Loading</p>
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
              <SavedLocationsCard data={savedLocations} onDelete={onDelete} />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorDetails: {
    fontSize: 14,
    color: "#666",
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
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  userInfoSection: {
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "500",
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
    borderBottomColor: "#dddddd",
    borderBottomWidth: 1,
    borderTopColor: "#dddddd",
    borderTopWidth: 1,
    flexDirection: "row",
    height: 100,
  },
  infoBox: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  menuWrapper: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    paddingVertical: 10,
    justifyContent: "center",
    width: "100%",
  },
  menuItemText: {
    color: "#777777",
    marginLeft: 20,
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 26,
  },
});
