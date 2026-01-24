import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useKyClient } from "../services/kyClient";
import { paths } from "../types/api";

export type UpdateProfileData = NonNullable<
  paths["/profile"]["patch"]["requestBody"]
>["content"]["application/json"];

type UpdateProfileResponse = NonNullable<
  paths["/profile"]["patch"]["responses"][200]["content"]["application/json"]
>;

interface UseUpdateProfileOptions {
  onSuccess?: (data: UpdateProfileResponse) => void;
  onError?: (error: Error) => void;
}

export const useUpdateProfile = (options?: UseUpdateProfileOptions) => {
  const client = useKyClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      return client
        .PATCH("/profile", {
          body: profileData,
        })
        .then((res) => {
          if (res.error) {
            throw new Error("Failed to update profile");
          }
          return res.data;
        });
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["profile"] });

        if (options?.onSuccess) {
          options.onSuccess(response);
        }
      }
    },
    onError: (err) => {
      if (options?.onError) {
        options.onError(err);
      }
    },
  });
};
