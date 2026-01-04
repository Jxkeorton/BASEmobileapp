import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ActivityIndicator } from "react-native-paper";
import { PurchasesPackage } from "react-native-purchases";
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
    try {
      await purchasePackage(pkg);
    } catch (error) {
      // Error is already handled in the provider
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
    } catch (error) {
      // Error is already handled in the provider
    }
  };

  const userHasAccessToPackage = (pkg: PurchasesPackage) => {
    if (isProUser) {
      return true;
    }

    if (customerInfo?.entitlements?.active) {
      return (
        customerInfo.entitlements.active[pkg.product.identifier] !== undefined
      );
    }

    return false;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.title}>Loading packages...</Text>
      </View>
    );
  }

  if (isProUser) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Image source={require("../assets/bitmap.png")} style={styles.image} />
        <Text style={styles.title}>You&apos;re a Pro User!</Text>
        <Text style={styles.text}>
          You have access to all premium features.
        </Text>
        <TouchableOpacity
          style={styles.backToMapButton}
          onPress={() => router.push("/(tabs)/map/Map")}
        >
          <Text style={styles.backToMapButtonText}>Back to Map</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const monthlyPackage = packages.find((pkg) => pkg.packageType === "MONTHLY");
  const yearlyPackage = packages.find((pkg) => pkg.packageType === "ANNUAL");

  if (!monthlyPackage || !yearlyPackage) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={styles.title}>No packages available</Text>
        <Text style={styles.text}>
          We&apos;re having trouble loading subscription options. Please try
          again later.
        </Text>
        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backToMapButton}
          onPress={() => router.push("/(tabs)/map/Map")}
        >
          <Text style={styles.backToMapButtonText}>Back to Map</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={require("../assets/bitmap.png")} style={styles.image} />
      <Text style={styles.title}>Unlock Pro Features</Text>
      <View style={styles.features}>
        <Text style={styles.featureItem}>✓ Precise Coordinates</Text>
        <Text style={styles.featureItem}>✓ Open Locations in Maps</Text>
        <Text style={styles.featureItem}>✓ Create a Logbook</Text>
        <Text style={styles.featureItem}>✓ More in depth Location Details</Text>
      </View>
      <View style={styles.bottomContainer}>
        {/* Monthly Package */}
        <LinearGradient colors={["#007AFF", "#00AFFF"]} style={styles.package}>
          <Text
            style={[styles.packageText, { fontSize: 20, textAlign: "center" }]}
          >
            {monthlyPackage.product.title}
          </Text>
          <Text style={styles.packageText}>
            {monthlyPackage.product.priceString}
          </Text>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : userHasAccessToPackage(monthlyPackage) ? (
            <Text style={styles.accessText}>Already Purchased</Text>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePurchase(monthlyPackage)}
            >
              <Text style={styles.buttonText}>Purchase</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Yearly Package */}
        <LinearGradient colors={["#007AFF", "#00AFFF"]} style={styles.package}>
          <Text
            style={[styles.packageText, { fontSize: 20, textAlign: "center" }]}
          >
            {yearlyPackage.product.title}
          </Text>
          <Text style={styles.packageText}>
            {yearlyPackage.product.priceString}
          </Text>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : userHasAccessToPackage(yearlyPackage) ? (
            <Text style={styles.accessText}>Already Purchased</Text>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => handlePurchase(yearlyPackage)}
            >
              <Text style={styles.buttonText}>Purchase</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>

      {!loading && (
        <View style={styles.trialContainer}>
          <Text style={styles.trialText}>
            A 7 Day Free trial will be applied if it is your first time
            subscribing
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToMapButton}
        onPress={() => router.push("/(tabs)/map/Map")}
      >
        <Text style={styles.backToMapButtonText}>Back to Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  title: {
    fontSize: 27,
    marginBottom: 10,
    marginTop: 20,
    color: "white",
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginHorizontal: 40,
    marginTop: 10,
  },
  bottomContainer: {
    flexDirection: "row",
  },
  package: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    height: 150,
    marginTop: 30,
    marginHorizontal: 5,
  },
  packageText: {
    fontSize: 16,
    marginBottom: 5,
    color: "white",
    fontWeight: "bold",
    textShadowColor: "black",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 2,
  },
  accessText: {
    fontSize: 16,
    color: "lightgray",
    fontStyle: "italic",
  },
  image: {
    width: 200,
    height: 200,
  },
  features: {
    alignItems: "flex-start",
    marginTop: 20,
  },
  featureItem: {
    fontSize: 16,
    color: "white",
    marginBottom: 5,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: "80%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  restoreButton: {
    marginTop: 15,
    padding: 10,
  },
  restoreButtonText: {
    color: "#007AFF",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  backToMapButton: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
    width: "80%",
  },
  backToMapButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  trialText: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
  trialContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
});

export default PayWall;
