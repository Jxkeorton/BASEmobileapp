import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../../../providers/AuthProvider";
import { useKyClient } from "../../../services/kyClient";
import { paths } from "../../../types/api";

type UpdateProfileData = NonNullable<
  paths["/profile"]["patch"]["requestBody"]
>["content"]["application/json"];

const EditProfile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jumpNumber, setJumpNumber] = useState("");
  const [username, setUsername] = useState("");
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      return client
        .PATCH("/profile", {
          json: profileData,
        })
        .then((res) => {
          if (res.error) {
            throw new Error("Failed to update profile");
          }
          return res.data;
        });
    },
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate and refetch profile queries
        queryClient.invalidateQueries({ queryKey: ["profile"] });

        router.back();

        Toast.show({
          type: "success",
          text1: "Profile updated successfully",
          position: "top",
        });
      }
    },
    onError: (error) => {
      console.error("Update profile error:", error);

      let errorMessage = "Failed to update profile";
      let errorDetails = "";

      Toast.show({
        type: "error",
        text1: errorMessage,
        text2: errorDetails,
        position: "top",
      });
    },
  });

  // Load profile data when component focuses
  useFocusEffect(
    React.useCallback(() => {
      if (profileResponse?.success && profileResponse?.data) {
        const profile = profileResponse.data;
        setName(profile.name || "");
        setEmail(profile.email || "");
        setUsername(profile.username || "");
        setJumpNumber(profile.jump_number?.toString() || "0");
      }
    }, [profileResponse])
  );

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      Toast.show({
        type: "error",
        text1: "Authentication required",
        text2: "Please log in to update profile",
        position: "top",
      });
      return;
    }

    // Basic validation
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Name is required",
        position: "top",
      });
      return;
    }

    if (jumpNumber && isNaN(parseInt(jumpNumber))) {
      Toast.show({
        type: "error",
        text1: "Jump number must be a valid number",
        position: "top",
      });
      return;
    }

    try {
      // Prepare update data (only include fields that have values)
      const profileData: UpdateProfileData = {
        name: profileResponse?.data?.name || "",
        username: profileResponse?.data?.username || "",
        jump_number: profileResponse?.data?.jump_number || 0,
      };

      if (name.trim() !== profileResponse?.data?.name) {
        profileData.name = name.trim();
      }

      if (username.trim() !== profileResponse?.data?.username) {
        profileData.username = username.trim();
      }

      const jumpNum = parseInt(jumpNumber) || 0;
      if (jumpNum !== profileResponse?.data?.jump_number) {
        profileData.jump_number = jumpNum;
      }

      // Only submit if there are actual changes
      if (Object.keys(profileData).length === 0) {
        Toast.show({
          type: "info",
          text1: "No changes to save",
          position: "top",
        });
        return;
      }

      await updateProfileMutation.mutateAsync(profileData);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  // Loading state
  if (profileLoading) {
    return (
      <PaperProvider>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#00ABF0" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </PaperProvider>
    );
  }

  // Error state
  if (profileError) {
    return (
      <PaperProvider>
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={styles.errorText}>Error loading profile</Text>
          <Text style={styles.errorDetails}>{profileError.message}</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={{ margin: 20 }}>
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <View style={styles.profilePlaceholder}>
              <FontAwesome name="user" size={40} color="#ccc" />
            </View>
            <Text style={styles.profileName}>{name || "No name set"}</Text>
          </View>

          <View style={styles.action}>
            <FontAwesome name="user-o" size={20} />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#666666"
              autoCorrect={false}
              value={name}
              style={styles.textInput}
              onChangeText={setName}
            />
          </View>

          <View style={styles.action}>
            <FontAwesome name="envelope-o" size={20} />
            <TextInput
              placeholder="Email (read-only)"
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCorrect={false}
              value={email}
              style={[styles.textInput, styles.readOnlyInput]}
              editable={false}
            />
          </View>

          <View style={styles.action}>
            <FontAwesome name="at" size={20} />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#666666"
              autoCorrect={false}
              autoCapitalize="none"
              value={username}
              style={styles.textInput}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.action}>
            <FontAwesome name="plane" size={20} />
            <TextInput
              placeholder="Total BASE jumps"
              placeholderTextColor="#666666"
              autoCorrect={false}
              value={jumpNumber}
              style={styles.textInput}
              keyboardType="numeric"
              onChangeText={setJumpNumber}
            />
          </View>

          {updateProfileMutation.isPending ? (
            <View style={styles.loadingButtonContainer}>
              <ActivityIndicator size="large" color="#00ABF0" />
              <Text style={styles.loadingText}>Updating profile...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.commandButton}
              onPress={handleSubmit}
            >
              <Text style={styles.panelButtonTitle}>Update Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </PaperProvider>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  },
  errorDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  profilePlaceholder: {
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  profileName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#00ABF0",
    alignItems: "center",
    marginTop: 20,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  action: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    paddingBottom: 10,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 0 : -12,
    paddingLeft: 15,
    color: "#05375a",
    fontSize: 16,
  },
  readOnlyInput: {
    color: "#999",
  },
  loadingButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
});
