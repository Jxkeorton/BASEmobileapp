import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ActivityIndicator } from "react-native-paper";
import { PurchasesPackage } from "react-native-purchases";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRevenueCat } from "../providers/RevenueCatProvider";

const PayWall = () => {
  const {
    packages,
    isProUser,
    loading,
    purchasePackage,
    restorePurchases,
    customerInfo,
  } = useRevenueCat();

  const handlePurchase = async (pkg: PurchasesPackage) => {
    await purchasePackage(pkg);
  };

  const handleRestore = async () => {
    await restorePurchases();
  };

  const redirectToMap = () => {
    router.replace("/(tabs)/map/Map");
  };

  const userHasAccessToPackage = (pkg: PurchasesPackage) => {
    if (isProUser) return true;
    if (customerInfo?.entitlements?.active) {
      return (
        customerInfo.entitlements.active[pkg.product.identifier] !== undefined
      );
    }
    return false;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.title}>Loading packages...</Text>
      </View>
    );
  }

  if (isProUser) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Image source={require("../assets/bitmap.png")} style={styles.image} />
        <Text style={styles.title}>You&apos;re a Pro User!</Text>
        <Text style={styles.text}>
          You have access to all premium features.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={redirectToMap}>
          <Text style={styles.primaryButtonText}>Back to Map</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const monthlyPackage = packages.find((pkg) => pkg.packageType === "MONTHLY");
  const yearlyPackage = packages.find((pkg) => pkg.packageType === "ANNUAL");

  if (!monthlyPackage || !yearlyPackage) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>No packages available</Text>
        <Text style={styles.text}>
          We&apos;re having trouble loading subscription options. Please try
          again later.
        </Text>
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={redirectToMap}>
          <Text style={styles.primaryButtonText}>Back to Map</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Top: image + title + features */}
        <View style={styles.top}>
          <View style={styles.headerRow}>
            <Image
              source={require("../assets/bitmap.png")}
              style={styles.image}
            />
            <View style={styles.headerText}>
              <Text style={styles.title}>Pro Features</Text>
              {[
                "Precise Coordinates",
                "Open location pins in maps",
                "Create a Logbook",
                "Location Details",
              ].map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureItem}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Packages */}
        <View style={styles.packagesContainer}>
          {/* Annual */}
          <View style={styles.annualWrapper}>
            <LinearGradient
              colors={["#0055CC", "#007AFF"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.packageTitle}>
              {yearlyPackage.product.title}
            </Text>
            <Text style={styles.packagePrice}>
              {yearlyPackage.product.priceString}
            </Text>
            <Text style={styles.packagePeriod}>per year</Text>
            {userHasAccessToPackage(yearlyPackage) ? (
              <Text style={styles.accessText}>Already Purchased</Text>
            ) : (
              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={() => handlePurchase(yearlyPackage)}
              >
                <Text style={styles.purchaseButtonText}>Get Annual</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Monthly */}
          <View style={styles.monthlyPackage}>
            <Text style={styles.packageTitle}>
              {monthlyPackage.product.title}
            </Text>
            <Text style={styles.packagePrice}>
              {monthlyPackage.product.priceString}
            </Text>
            <Text style={styles.packagePeriod}>per month</Text>
            {userHasAccessToPackage(monthlyPackage) ? (
              <Text style={styles.accessText}>Already Purchased</Text>
            ) : (
              <TouchableOpacity
                style={styles.purchaseButtonOutline}
                onPress={() => handlePurchase(monthlyPackage)}
              >
                <Text style={styles.purchaseButtonOutlineText}>
                  Get Monthly
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom */}
        <View style={styles.bottom}>
          <Text style={styles.trialText}>
            7-day free trial applied for first-time subscribers.
          </Text>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
          >
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={redirectToMap}
          >
            <Text style={styles.primaryButtonText}>Back to Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "black",
  },
  screen: {
    flex: 1,
    backgroundColor: "black",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "black",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  centered: {
    justifyContent: "center",
  },
  // Header
  top: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  featureCheck: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "bold",
    width: 18,
  },
  featureItem: {
    fontSize: 13,
    color: "white",
    fontWeight: "500",
    flex: 1,
  },
  // Packages
  packagesContainer: {
    width: "100%",
    marginTop: 20,
  },
  annualWrapper: {
    width: "100%",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  monthlyPackage: {
    width: "100%",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#3A3A3C",
    borderWidth: 1,
    borderColor: "#636366",
  },
  packageTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  packagePrice: {
    fontSize: 28,
    color: "white",
    fontWeight: "800",
    marginBottom: 2,
  },
  packagePeriod: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
  },
  accessText: {
    fontSize: 14,
    color: "lightgray",
    fontStyle: "italic",
    marginTop: 12,
  },
  purchaseButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    width: "100%",
  },
  purchaseButtonText: {
    color: "#007AFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
  purchaseButtonOutline: {
    borderWidth: 2,
    borderColor: "white",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    width: "100%",
  },
  purchaseButtonOutlineText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
  // Bottom
  bottom: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  trialText: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  restoreButton: {
    padding: 8,
    marginBottom: 4,
  },
  restoreButtonText: {
    color: "#007AFF",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
    width: "100%",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
});

export default PayWall;
