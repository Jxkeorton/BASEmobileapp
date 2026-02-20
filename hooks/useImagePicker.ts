import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

interface UseImagePickerProps {
  imagePickerOptions?: ImagePicker.ImagePickerOptions;
}

export const useImagePicker = async ({
  imagePickerOptions,
}: UseImagePickerProps) => {
  // No permissions request is necessary for launching the image library.
  // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
  // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
  // so the app users aren't surprised by a system dialog after picking a video.
  // See "Invoke permissions for videos" sub section for more details.
  const permissionResult =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permissionResult.granted) {
    Alert.alert(
      "Permission required",
      "Permission to access the media library is required.",
    );
    return;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    ...imagePickerOptions,
  });

  if (!result.canceled) {
    return result.assets;
  } else {
    return undefined;
  }
};
