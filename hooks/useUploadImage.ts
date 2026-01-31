import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useKyClient } from "../services/kyClient";
import { paths } from "../types/api";

type UploadResponse = NonNullable<
  paths["/image"]["post"]["responses"][200]["content"]["application/json"]
>;

type PresetType =
  | "profile_images"
  | "logbook_images"
  | "location_images"
  | "location_submissions";

interface UploadImageParams {
  imageUri: string;
  preset: PresetType;
}

interface UseUploadImageOptions {
  onSuccess?: (data: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export const useUploadImage = (options?: UseUploadImageOptions) => {
  const client = useKyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageUri, preset }: UploadImageParams) => {
      const uriParts = imageUri.split(".");
      const fileExtension =
        uriParts[uriParts.length - 1]?.toLowerCase() || "jpg";
      const mimeType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;

      const filename = imageUri.split("/").pop() || `photo.${fileExtension}`;

      const formData = new FormData();

      // For React Native:
      formData.append("file", {
        uri: imageUri,
        name: filename,
        type: mimeType,
      } as any);

      const res = await client.POST("/image", {
        params: {
          query: { preset },
        },
        body: formData as any,
      });

      if (!res.data) {
        throw new Error("Failed to upload image");
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      return res.data;
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error as Error);
      throw error;
    },
  });
};
