import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useRevenueCat } from "../providers/RevenueCatProvider";

export const useProtectedRoute = () => {
  const { isProUser, loading: revenueCatLoading } = useRevenueCat();
  const router = useRouter();

  useEffect(() => {
    if (!revenueCatLoading && !isProUser) {
      router.replace("/SubscriptionsPage");
    }
  }, [revenueCatLoading, isProUser, router]);

  return {
    isProUser,
    loading: revenueCatLoading,
    isAuthorized: isProUser,
  };
};
