import { useEffect, useState } from "react";
import { Snackbar } from "react-native-paper";
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
  const [visible, setVisible] = useState(!!error);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const handleError = async () => {
      setVisible(!!error);

      if (!error) {
        return;
      }

      // Check if it's an ErrorResponse
      if (isErrorResponse(error)) {
        setMessage(error.message);
        return;
      }

      // HTTPError from ky
      if (error.response && typeof error.response.json === "function") {
        const errorData = await error.response.json();
        if (errorData.message) {
          setMessage(errorData.message);
        } else {
          setMessage("An unexpected error occurred.");
        }
      } else {
        setMessage("An unexpected error occurred.");
      }
    };

    handleError();
  }, [error]);

  return (
    <Snackbar
      visible={visible}
      onDismiss={() => {
        setVisible(false);
        onDismiss?.();
      }}
      duration={4000}
      style={{ backgroundColor: "#d32f2f" }}
      wrapperStyle={{ top: 0 }}
    >
      {message}
    </Snackbar>
  );
};

export default APIErrorHandler;
