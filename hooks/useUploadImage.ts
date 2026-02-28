import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getBaseUrl, kyInstance } from "../services/kyClient";

type PresetType =
  | "profile_images"
  | "logbook_images"
  | "location_images"
  | "location_submissions";

interface UploadImageParams {
  imageUris: string[];
  preset: PresetType;
}

interface CloudinaryUploadResponse {
  success: boolean;
  url?: string;
  secureUrl?: string;
  publicId?: string;
  error?: string;
}

export interface UploadImageResult {
  success: boolean;
  secureUrl?: string | undefined;
  secureUrls: string[];
}

interface UseUploadImageOptions {
  onSuccess?: (data: UploadImageResult) => void;
  onError?: (error: Error) => void;
}

export const useUploadImage = (options?: UseUploadImageOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      imageUris,
      preset,
    }: UploadImageParams): Promise<UploadImageResult> => {
      const baseUrl = getBaseUrl();
      const ky = kyInstance(60000);
      const allSecureUrls: string[] = [];

      for (const imageUri of imageUris) {
        const formData = new FormData();

        const uriParts = imageUri.split(".");
        const fileExtension =
          uriParts[uriParts.length - 1]?.toLowerCase() || "jpg";
        const mimeType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;
        const filename = imageUri.split("/").pop() || `photo.${fileExtension}`;

        formData.append("file", {
          uri: imageUri,
          name: filename,
          type: mimeType,
        } as any);

        const response = await ky.post(`${baseUrl}/image`, {
          searchParams: { preset },
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const data: CloudinaryUploadResponse = await response.json();

        if (!data?.success || !data.secureUrl) {
          throw new Error(data?.error || `Failed to upload ${filename}`);
        }

        allSecureUrls.push(data.secureUrl);
      }

      queryClient.invalidateQueries({ queryKey: ["profile"] });

      return {
        success: true,
        secureUrl: allSecureUrls[0],
        secureUrls: allSecureUrls,
      };
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
