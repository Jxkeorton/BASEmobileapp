import { useEffect, useState } from "react";
import { Snackbar } from "react-native-paper";

interface APIErrorHandlerProps {
  error: any;
  onDismiss?: () => void;
}

const APIErrorHandler = ({ error, onDismiss }: APIErrorHandlerProps) => {
  const [visible, setVisible] = useState(!!error);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    setVisible(!!error);

    if (error.success === false && error.error) {
      setMessage(error.error);
    } else if (error.message) {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }
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
    >
      {message}
    </Snackbar>
  );
};

export default APIErrorHandler;
