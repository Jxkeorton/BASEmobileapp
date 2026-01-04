import { ErrorToast, SuccessToast } from "../components/toast/ToastComponents";

export const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <ErrorToast {...props} />,
};
