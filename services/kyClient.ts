import AsyncStorage from "@react-native-async-storage/async-storage";
import ky from "ky";
import createClient from "openapi-fetch";
import { paths } from "../types/api";

const getBaseUrl = () => {
  if (__DEV__) {
    // TODO: create dev environment
    const devUrl = "https://basemapapi-production.up.railway.app";
    return devUrl;
  }

  const prodBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
  return prodBaseURL;
};

let baseUrl = getBaseUrl();

export const kyInstance = (timeout: number) =>
  ky.create({
    headers: {
      "x-api-key": process.env.EXPO_PUBLIC_API_KEY,
    },
    timeout: timeout,
    retry: {
      limit: 2,
      methods: ["get"],
    },
    hooks: {
      beforeRequest: [
        async (request) => {
          const token = await AsyncStorage.getItem("auth_token");

          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }

          const method = request.method.toLowerCase();

          const hasBody = request.body !== null && request.body !== undefined;

          if (hasBody && !request.headers.get("Content-Type")) {
            request.headers.set("Content-Type", "application/json");
          }

          if (method === "get") {
            request.headers.delete("Content-Type");
          }
        },
      ],
    },
  });

export const useKyClient = () => {
  return createClient<paths>({
    baseUrl,
    fetch: kyInstance(30000),
  });
};
