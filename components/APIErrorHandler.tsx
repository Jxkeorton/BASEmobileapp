import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { ErrorResponse } from "../types/error-response";

interface APIErrorHandlerProps {
  error: any;
  onDismiss?: () => void;
}

function isErrorResponse(error: any): error is ErrorResponse {
  return (
    typeof error === "object" &&
    error !== null &&
    "success" in error &&
    error.success === false &&
    "message" in error &&
    typeof error.message === "string"
  );
}

const APIErrorHandler = ({ error, onDismiss }: APIErrorHandlerProps) => {
  useEffect(() => {
    const handleError = async () => {
      if (!error) {
        return;
      }

      let message = "An unexpected error occurred.";

      // Check if it's an ErrorResponse
      if (isErrorResponse(error)) {
        message = error.message;
      }
      // HTTPError from ky
      else if (error.response && typeof error.response.json === "function") {
        try {
          const errorData = await error.response.json();
          if (errorData.message) {
            message = errorData.message;
          }
        } catch {
          // If JSON parsing fails, use default message
        }
      }
      // Generic error with message property
      else if (error.message) {
        message = error.message;
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: message,
        visibilityTime: 4000,
        position: "top",
        topOffset: 60,
      });

      // Call onDismiss after showing toast
      onDismiss?.();
    };

    handleError();
  }, [error, onDismiss]);

  return null; // No UI needed, toast handles display
};

export default APIErrorHandler;
