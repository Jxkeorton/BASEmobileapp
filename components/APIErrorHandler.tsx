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

    if (error?.message) {
      setMessage(error.message);
    } else if (error?.error) {
      setMessage(error.error);
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
      wrapperStyle={{ top: 0 }}
    >
      {message}
    </Snackbar>
  );
};

export default APIErrorHandler;
