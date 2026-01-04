import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import Toast from "react-native-toast-message";
import { useAuth } from "./AuthProvider";

interface RevenueCatContextType {
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  packages: PurchasesPackage[];
  isProUser: boolean;
  loading: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<CustomerInfo>;
  restorePurchases: () => Promise<CustomerInfo>;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(
  undefined,
);

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error("useRevenueCat must be used within RevenueCatProvider");
  }
  return context;
};

interface RevenueCatProviderProps {
  children: React.ReactNode;
}

const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY,
}) as string;

// Entitlement identifier from RevenueCat dashboard
const ENTITLEMENT_ID = "proFeatures";

export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        if (!REVENUECAT_API_KEY) {
          setLoading(false);
          return;
        }

        Purchases.setLogLevel(
          __DEV__ ? Purchases.LOG_LEVEL.ERROR : Purchases.LOG_LEVEL.WARN,
        );

        // Initialize with the user's ID from Supabase
        if (user?.id) {
          Purchases.configure({
            apiKey: REVENUECAT_API_KEY,
            appUserID: user.id,
          });

          try {
            const { customerInfo: loginInfo } = await Purchases.logIn(user.id);
            setCustomerInfo(loginInfo);
          } catch (err) {
            const info = await Purchases.getCustomerInfo();
            setCustomerInfo(info);
          }

          const offerings = await Purchases.getOfferings();
          if (offerings.current) {
            setOfferings(offerings.current);
          }
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Subscription Error",
          text2: "Failed to initialize subscription system",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeRevenueCat();
  }, [user?.id]);

  // Listen to customer info updates
  useEffect(() => {
    if (!user?.id) return;

    Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    });
  }, [user?.id, queryClient]);

  const isProUser = useMemo(() => {
    if (!customerInfo) return false;
    return (
      typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
    );
  }, [customerInfo]);

  const purchasePackage = async (
    pkg: PurchasesPackage,
  ): Promise<CustomerInfo> => {
    try {
      setLoading(true);

      const { customerInfo: purchaseInfo } =
        await Purchases.purchasePackage(pkg);

      setCustomerInfo(purchaseInfo);

      // Check if purchase was successful
      if (purchaseInfo.entitlements.active[ENTITLEMENT_ID]) {
        Toast.show({
          type: "success",
          text1: "Purchase Successful",
          text2: "You now have access to all Pro features!",
        });

        queryClient.invalidateQueries({ queryKey: ["profile"] });

        setTimeout(() => {
          router.push("/(tabs)/map/Map");
        }, 1000);
      }

      return purchaseInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        Toast.show({
          type: "info",
          text1: "Purchase Cancelled",
          text2: "You can upgrade to Pro anytime",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Purchase Failed",
          text2: error.message || "An error occurred during purchase",
        });
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const restorePurchases = async (): Promise<CustomerInfo> => {
    try {
      setLoading(true);

      const restoredInfo = await Purchases.restorePurchases();
      setCustomerInfo(restoredInfo);

      if (restoredInfo.entitlements.active[ENTITLEMENT_ID]) {
        Toast.show({
          type: "success",
          text1: "Purchases Restored",
          text2: "Your Pro subscription has been restored!",
        });

        queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        Toast.show({
          type: "info",
          text1: "No Purchases Found",
          text2: "No active subscriptions to restore",
        });
      }

      return restoredInfo;
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Restore Failed",
        text2: error.message || "Failed to restore purchases",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const packages = useMemo(() => {
    if (!offerings?.availablePackages) return [];

    const validPackages = offerings.availablePackages.filter((pkg) => {
      // Only include monthly and annual packages
      return pkg.packageType === "MONTHLY" || pkg.packageType === "ANNUAL";
    });

    return validPackages.sort((a, b) => {
      const order = { MONTHLY: 0, ANNUAL: 1 };
      return (
        order[a.packageType as keyof typeof order] -
        order[b.packageType as keyof typeof order]
      );
    });
  }, [offerings]);

  const value: RevenueCatContextType = {
    customerInfo,
    offerings,
    packages,
    isProUser,
    loading,
    purchasePackage,
    restorePurchases,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};
