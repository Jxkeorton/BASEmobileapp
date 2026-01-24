import { FontAwesome } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, PaperProvider } from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import {
  ControlledPaperEmailInput,
  ControlledPaperTextInput,
} from "../../../components/form";
import {
  UpdateProfileData,
  useUpdateProfile,
} from "../../../hooks/useUpdateProfile";
import { useAuth } from "../../../providers/SessionProvider";
import { useKyClient } from "../../../services/kyClient";
import {
  editProfileSchema,
  type EditProfileFormData,
} from "../../../utils/validationSchemas";

const EditProfile = () => {
  const [error, setError] = useState<any>(null);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const client = useKyClient();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<EditProfileFormData>({
    resolver: yupResolver(editProfileSchema) as any,
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const name = watch("name");

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

  const updateProfileMutation = useUpdateProfile({
    onSuccess: () => {
      router.replace("/(tabs)/profile/Profile");
    },
    onError: (err) => {
      setError(err);
    },
  });

  useEffect(() => {
    if (profileResponse?.success && profileResponse?.data) {
      const profile = profileResponse.data;

      setValue("name", profile.name || "");
      setValue("email", profile.email || "");
      if (profile.username) {
        setValue("username", profile.username);
      }
      if (profile.jump_number !== null && profile.jump_number !== undefined) {
        setValue("jump_number", profile.jump_number.toString());
      }
    }
  }, [profileResponse, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    const profileData: UpdateProfileData = {};

    if (data.name?.trim() !== profileResponse?.data?.name) {
      profileData.name = data.name.trim();
    }

    if (data.username?.trim() !== profileResponse?.data?.username) {
      profileData.username = data.username?.trim() || "";
    }

    if (
      data.jump_number !== undefined &&
      data.jump_number !== profileResponse?.data?.jump_number
    ) {
      // Convert to number if it's a string
      const jumpNumber =
        typeof data.jump_number === "string"
          ? parseInt(data.jump_number, 10)
          : data.jump_number;
      profileData.jump_number = jumpNumber;
    }

    // Only submit if there are changes
    if (Object.keys(profileData).length === 0) {
      router.replace("/(tabs)/profile/Profile");
      return;
    }

    await updateProfileMutation.mutateAsync(profileData);
  });

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

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center", marginBottom: 30 }}>
            <View style={styles.profilePlaceholder}>
              <FontAwesome name="user" size={40} color="#ccc" />
            </View>
            <Text style={styles.profileName}>{name || "No name set"}</Text>
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="user-o" size={20} style={styles.icon} />
            <View style={styles.inputWrapper}>
              <ControlledPaperTextInput
                control={control}
                name="name"
                label="Full Name"
                style={styles.textInput}
                mode="flat"
                autoCorrect={false}
                textColor="black"
                activeUnderlineColor="black"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="envelope-o" size={20} style={styles.icon} />
            <View style={styles.inputWrapper}>
              <ControlledPaperEmailInput
                control={control}
                name="email"
                label="Email (read-only)"
                style={[styles.textInput, styles.readOnlyInput]}
                mode="flat"
                disabled
                editable={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="at" size={20} style={styles.icon} />
            <View style={styles.inputWrapper}>
              <ControlledPaperTextInput
                control={control}
                name="username"
                label="Username"
                style={styles.textInput}
                mode="flat"
                autoCorrect={false}
                autoCapitalize="none"
                textColor="black"
                activeUnderlineColor="black"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome name="plane" size={20} style={styles.icon} />
            <View style={styles.inputWrapper}>
              <ControlledPaperTextInput
                control={control}
                name="jump_number"
                label="Total BASE jumps"
                style={styles.textInput}
                mode="flat"
                keyboardType="numeric"
                textColor="black"
                activeUnderlineColor="black"
              />
            </View>
          </View>

          {updateProfileMutation.isPending || isSubmitting ? (
            <View style={styles.loadingButtonContainer}>
              <ActivityIndicator size="large" color="#00ABF0" />
              <Text style={styles.loadingText}>Updating profile...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.commandButton}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.panelButtonTitle}>Update Profile</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace("/(tabs)/profile/Profile")}
            disabled={isSubmitting}
          >
            <Text style={styles.panelButtonTitle}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <APIErrorHandler
        error={error || profileError}
        onDismiss={() => setError(null)}
      />
    </PaperProvider>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
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
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#dc3545",
    alignItems: "center",
    marginTop: 20,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  icon: {
    marginTop: 10,
    marginRight: 10,
    color: "#666",
  },
  inputWrapper: {
    flex: 1,
  },
  textInput: {
    backgroundColor: "#fff",
  },
  readOnlyInput: {
    color: "#999",
  },
  loadingButtonContainer: {
    alignItems: "center",
    marginTop: 20,
  },
});
