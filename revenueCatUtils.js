// Initialize RevenueCat
const initializeRevenueCat = useCallback(async () => {
  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    if (Platform.OS === "android") {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.google });
    } else {
      await Purchases.configure({ apiKey: REVENUECAT_API_KEYS.apple });
    }

    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      // update state with customer info ?
    });

    const [offerings, customerInfo] = await Promise.all([
      Purchases.getOfferings(),
      Purchases.getCustomerInfo(),
    ]);

    return { offerings, customerInfo };
  } catch (error) {
    // Even if RevenueCat fails, mark as ready so app doesn't hang
    updateNestedState("subscription", { isReady: true });
  } finally {
    updateNestedState("loading", { subscription: false });
  }
}, [updateNestedState]);

const handlePurchasePackage = useCallback(
  async (pack) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);

      return { customerInfo };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  [updateNestedState],
);
