import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import Toast from "react-native-toast-message";
import APIErrorHandler from "../components/APIErrorHandler";
import { ControlledPaperSecureTextInput } from "../components/form";
import { useKyClient } from "../services/kyClient";
import {
  type ResetPasswordConfirmFormData,
  resetPasswordConfirmSchema,
} from "../utils/validationSchemas";

const ResetPasswordConfirm = () => {
  const [apiError, setApiError] = useState<any>(null);
  const [tokenHash, setTokenHash] = useState<string>("");
  const [otpType, setOtpType] = useState<string>("recovery");
  const [linkError, setLinkError] = useState<string | null>(null);
  const hasRedirectedToReset = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordConfirmFormData>({
    resolver: yupResolver(resetPasswordConfirmSchema),
    mode: "onBlur",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const params = useLocalSearchParams();

  const showLinkErrorToast = (message: string) => {
    Toast.show({
      type: "error",
      text1: "Reset Link Invalid",
      text2: message,
      position: "top",
    });
  };

  const isExpiredLinkError = (
    errorCode?: string,
    errorDescription?: string,
  ) => {
    const normalizedDescription = errorDescription?.toLowerCase() ?? "";

    return (
      errorCode === "otp_expired" ||
      normalizedDescription.includes("has expired") ||
      normalizedDescription.includes("invalid or has expired")
    );
  };

  const redirectToResetIfNeeded = (shouldRedirect: boolean) => {
    if (!shouldRedirect || hasRedirectedToReset.current) return;

    hasRedirectedToReset.current = true;
    router.replace("/(auth)/Reset");
  };

  useEffect(() => {
    const parseUrlParams = (url: string) => {
      const allParams: Record<string, string> = {};

      const queryStart = url.indexOf("?");
      const hashStart = url.indexOf("#");

      const queryEnd = hashStart === -1 ? url.length : hashStart;
      const queryFragment =
        queryStart !== -1 ? url.substring(queryStart + 1, queryEnd) : "";
      const hashFragment = hashStart !== -1 ? url.substring(hashStart + 1) : "";

      const readFragment = (fragment: string) => {
        if (!fragment) return;

        fragment.split("&").forEach((part) => {
          const [key, value] = part.split("=");
          if (!key) return;

          const rawValue = value ?? "";
          const decodedValue =
            key === "error_description"
              ? decodeURIComponent(rawValue.replace(/\+/g, " "))
              : decodeURIComponent(rawValue);

          allParams[key] = decodedValue;
        });
      };

      readFragment(queryFragment);
      readFragment(hashFragment);

      return allParams;
    };

    const handleIncomingParams = (incomingParams: Record<string, string>) => {
      const parsedTokenHash = incomingParams.token_hash;
      const parsedType = incomingParams.type;
      const errorCode = incomingParams.error_code;
      const errorDescription = incomingParams.error_description;

      if (parsedTokenHash) setTokenHash(parsedTokenHash);
      if (parsedType) setOtpType(parsedType);

      if (errorCode || errorDescription) {
        const shouldRedirectToReset = isExpiredLinkError(
          errorCode,
          errorDescription,
        );

        const message =
          errorDescription ||
          (errorCode === "otp_expired"
            ? "Email link is invalid or has expired"
            : "Unable to reset password with this link");

        setLinkError(message);
        showLinkErrorToast(message);
        redirectToResetIfNeeded(shouldRedirectToReset);
      }
    };

    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();

      if (url) {
        const parsedParams = parseUrlParams(url);
        handleIncomingParams(parsedParams);
      }
    };

    getInitialURL();

    // Listen for URL changes when app is already open
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const parsedParams = parseUrlParams(url);
      handleIncomingParams(parsedParams);
    });

    return () => subscription.remove();
  }, []);

  const token_hash: string = (params.token_hash as string) || tokenHash;
  const linkType: string = (params.type as string) || otpType || "recovery";
  const routeErrorDescription = params.error_description as string | undefined;
  const routeErrorCode = params.error_code as string | undefined;
  const client = useKyClient();

  useEffect(() => {
    if (!routeErrorCode && !routeErrorDescription) return;

    const shouldRedirectToReset = isExpiredLinkError(
      routeErrorCode,
      routeErrorDescription,
    );

    const message =
      routeErrorDescription ||
      (routeErrorCode === "otp_expired"
        ? "Email link is invalid or has expired"
        : "Unable to reset password with this link");

    setLinkError(message);
    showLinkErrorToast(message);
    redirectToResetIfNeeded(shouldRedirectToReset);
  }, [routeErrorCode, routeErrorDescription]);

  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      token_hash,
      type,
      new_password,
    }: {
      token_hash: string;
      type: "recovery";
      new_password: string;
    }) => {
      const result = await client.POST("/reset-password/confirm", {
        body: {
          token_hash,
          type,
          new_password,
        },
      });

      return result;
    },
    onSuccess: async (response) => {
      if (response.response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Password Reset Successful",
          text2: "You can now log in with your new password",
          position: "top",
        });

        router.replace("/(auth)/Login");
      }
    },
    onError: async (error: any) => {
      setApiError(error);
    },
  });

  const onSubmit = handleSubmit((data) => {
    const safeTokenHash = Array.isArray(token_hash)
      ? token_hash[0]
      : token_hash;
    const safeLinkType = Array.isArray(linkType) ? linkType[0] : linkType;

    if (linkError || !safeTokenHash || safeLinkType !== "recovery") {
      const message =
        linkError ||
        "Email link is invalid or has expired. Request a new reset link.";

      showLinkErrorToast(message);
      return;
    }

    resetPasswordMutation.mutate({
      token_hash: safeTokenHash,
      type: "recovery",
      new_password: data.newPassword,
    });
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.imageContainer}>
            <Image
              source={require("../assets/bitmap.png")}
              style={styles.image}
            />
          </View>

          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>Enter your new password below</Text>

          <ControlledPaperSecureTextInput
            control={control}
            name="newPassword"
            label="New Password"
            style={styles.textInput}
            activeOutlineColor="black"
            textColor="black"
          />

          <ControlledPaperSecureTextInput
            control={control}
            name="confirmPassword"
            label="Confirm New Password"
            style={styles.textInput}
            activeOutlineColor="black"
            textColor="black"
          />

          {resetPasswordMutation.isPending ? (
            <ActivityIndicator
              size="small"
              color="#007AFF"
              style={styles.loader}
            />
          ) : (
            <Button
              mode="contained"
              style={styles.resetButton}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              Reset Password
            </Button>
          )}

          <Button
            mode="text"
            style={styles.cancelButton}
            textColor="#007AFF"
            onPress={() => router.replace("/(auth)/Login")}
          >
            Cancel
          </Button>
          <APIErrorHandler
            error={apiError}
            onDismiss={() => setApiError(null)}
          />
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 30,
  },
  textInput: {
    marginVertical: 5,
    height: 50,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
  },
  resetButton: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
    marginVertical: 10,
  },
  loader: {
    marginTop: 20,
  },
});

export default ResetPasswordConfirm;
