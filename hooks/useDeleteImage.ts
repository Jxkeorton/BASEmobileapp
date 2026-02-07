import { useMutation } from "@tanstack/react-query";
import { useKyClient } from "../services/kyClient";
import { paths } from "../types/api";

interface DeleteImageParams {
  secureUrl: string;
  authToken?: string;
}

type DeleteResponse = NonNullable<
  paths["/image/{publicId}"]["delete"]["responses"][200]["content"]["application/json"]
>;

// Helper function to extract publicId from Cloudinary secure URL
const getPublicIdFromUrl = (secureUrl: string): string => {
  // Example URL: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{publicId}.{format}
  const urlParts = secureUrl.split("/");
  const uploadIndex = urlParts.indexOf("upload");

  if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
    throw new Error("Invalid Cloudinary URL format");
  }

  // Get the part after version (skip 'v' + version number)
  const fileNameWithExtension = urlParts.slice(uploadIndex + 2).join("/");

  // Remove file extension
  const publicId = fileNameWithExtension.replace(/\.[^/.]+$/, "");

  return publicId;
};

export const useDeleteImage = (options?: {
  onSuccess?: (data: DeleteResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const client = useKyClient();

  return useMutation({
    mutationFn: async ({ secureUrl }: DeleteImageParams) => {
      const publicId = getPublicIdFromUrl(secureUrl);

      const result = await client.DELETE("/image/{publicId}", {
        params: { path: { publicId } },
      });

      if (!result.data) {
        throw new Error("Failed to delete image");
      }

      return result.data as DeleteResponse;
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error as Error);
    },
  });
};
