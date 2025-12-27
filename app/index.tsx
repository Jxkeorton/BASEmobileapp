import { router, useRootNavigationState, useSegments } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { useAuth } from "../providers/AuthProvider";

const Index = () => {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }

    if (loading) {
      return;
    }
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/Login");
    } else if (isAuthenticated) {
      router.replace("/(tabs)/map");
    }
  }, [segments, navigationState?.key, isAuthenticated, loading, user]);

  if (!navigationState?.key || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={true}
          color={MD2Colors.red800}
          size="large"
        />
        <Text style={styles.loadingText}>
          {!navigationState?.key && "Loading navigation..."}
          {loading && "Checking authentication..."}
        </Text>
        <Text style={styles.debugText}>
          Navigation: {navigationState?.key ? "✅" : "❌"} | Auth Loading:{" "}
          {loading ? "🔄" : "✅"} | User: {user?.email || "Not logged in"}
        </Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "white",
    marginTop: 20,
    fontSize: 16,
  },
  debugText: {
    color: "#666",
    marginTop: 10,
    fontSize: 12,
    textAlign: "center",
  },
});

export default Index;
