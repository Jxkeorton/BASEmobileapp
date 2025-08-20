import { useEffect, useState } from "react";
import { Snackbar } from "react-native-paper";
import { ErrorResponse } from "../types/error-response";

interface APIErrorHandlerProps {
  error: any; // raw error object
  onDismiss?: () => void;
}

const APIErrorHandler = ({ error, onDismiss }: APIErrorHandlerProps) => {
  const [visible, setVisible] = useState(!!error);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    setVisible(!!error);

    const parseError = async () => {
      if (!error) {
        setMessage("");
        return;
      }
      try {
        if (error.response && typeof error.response.json === "function") {
          const errorBody: ErrorResponse = await error.response.json();
          if (isMounted)
            setMessage(errorBody.error || "An unexpected error occurred.");
        } else if (error.message) {
          setMessage(error.message);
        } else {
          setMessage("An unexpected error occurred.");
        }
      } catch {
        setMessage("An unexpected error occurred.");
      }
    };

    parseError();

    return () => {
      isMounted = false;
    };
  }, [error]);

  if (!error || !message) return null;

  return (
    <Snackbar
      visible={visible}
      onDismiss={() => {
        setVisible(false);
        onDismiss?.();
      }}
      duration={4000}
      style={{ backgroundColor: "#d32f2f" }}
    >
      {message}
    </Snackbar>
  );
};

export default APIErrorHandler;
