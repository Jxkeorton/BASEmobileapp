import { useMutation } from "@tanstack/react-query";
import { File } from "expo-file-system";
import { useKyClient } from "../services/kyClient";
import { paths } from "../types/api";

type UploadResponse = NonNullable<
  paths["/image"]["post"]["responses"][200]["content"]["application/json"]
>;

type PresetType = "profile" | "logbook" | "locations" | "location_submissions";

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

  return useMutation({
    mutationFn: async ({ imageUri, preset }: UploadImageParams) => {
      const file = new File(imageUri);
      if (!file.exists) {
        throw new Error("File does not exist");
      }

      const formData = new FormData();
      formData.append("file", file, file.name);

      const res = await client.POST("/image", {
        params: {
          query: { preset },
        },
        body: formData as any, // OpenAPI incorrectly types FormData body as string
      });

      if (!res.data) {
        throw new Error("Failed to upload image");
      }
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error as Error);
    },
  });
};
