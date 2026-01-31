import { useMutation } from "@tanstack/react-query";
import { useKyClient } from "../services/kyClient";
import { paths } from "../types/api";

interface DeleteImageParams {
  publicId: string;
  authToken?: string;
}

type DeleteResponse = NonNullable<
  paths["/image/{publicId}"]["delete"]["responses"][200]["content"]["application/json"]
>;

export const useDeleteImage = (options?: {
  onSuccess?: (data: DeleteResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const client = useKyClient();

  return useMutation({
    mutationFn: async ({ publicId }: DeleteImageParams) => {
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
