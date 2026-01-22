import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Button, Card, Text } from "react-native-paper";
import APIErrorHandler from "../../../components/APIErrorHandler";
import { useAuth } from "../../../providers/SessionProvider";
import { useKyClient } from "../../../services/kyClient";
import { paths } from "../../../types/api";

type LogbookEntry = NonNullable<
  paths["/logbook"]["get"]["responses"][200]["content"]["application/json"]["data"]
>["entries"][number];

const JumpDetails = () => {
  const [jump, setJump] = useState<LogbookEntry | undefined>(undefined);
  const [error, setError] = useState<any>(null);
  const params = useLocalSearchParams();
  const client = useKyClient();

  // Type assertions for params
  const jumpindex = Number(params.jumpindex);
  const jumpNumber = params.jumpNumber as string | undefined;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: logbookResponse,
    isLoading: loadingJumps,
    error: jumpsError,
  } = useQuery({
    queryKey: ["logbook", user?.id],
    queryFn: async () => {
      return client.GET("/logbook").then((res) => {
        if (res.error) {
          throw new Error("Failed to fetch locations");
        }
        return res.data;
      });
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });

  const deleteJumpMutation = useMutation({
    mutationFn: async (jumpId: string) => {
      return client
        .DELETE("/logbook/{id}", { params: { path: { id: jumpId } } })
        .then((res: any) => {
          if (res.error) {
            throw new Error("Failed to delete jump");
          }
          if (!res.data?.success) {
            throw new Error("Failed to delete jump");
          }
          return res.data;
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbook", user?.id] });
      router.back();
    },
    onError: (err) => {
      setError(err);
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        if (
          logbookResponse?.success &&
          logbookResponse?.data?.entries &&
          typeof jumpindex === "number" &&
          !isNaN(jumpindex)
        ) {
          const jumps = logbookResponse.data.entries;

          // Reverse the jumps array to match the original ordering
          const reversedJumps = [...jumps].reverse();

          // Check if jumpindex is a valid index in the reversedJumps array
          if (jumpindex >= 0 && jumpindex < reversedJumps.length) {
            const selectedJump = reversedJumps[jumpindex];
            setJump(selectedJump);
          }
        }
      };

      if (logbookResponse) {
        loadData();
      }
    }, [jumpindex, logbookResponse]),
  );

  const handleDeleteJump = async () => {
    if (jump) {
      await deleteJumpMutation.mutateAsync(jump.id);
    } else {
      setError({ message: "Jump data is not available for deletion." });
    }
  };

  if (loadingJumps || deleteJumpMutation.isPending) {
    return (
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>
          {deleteJumpMutation.isPending
            ? "Processing..."
            : "Loading jump details..."}
        </Text>
      </LinearGradient>
    );
  }

  if (!jump) {
    return (
      <LinearGradient
        colors={["#00ABF0", "#0088CC", "#006699"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.noJumpContainer}
      >
        <Text style={{ fontSize: 25, color: "#fff" }}>
          Cannot fetch jump details. Please try again.
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#00ABF0", "#0088CC", "#006699"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.pageTitle}>
          Jump {jumpNumber || "N/A"}
        </Text>

        {jump.location_name && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionLabel}>Location</Text>
              <Text style={styles.locationName}>
                {jump.location_name.toUpperCase()}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Jump Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Exit Type:</Text>
              <Text style={styles.infoValue}>{jump.exit_type || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delay:</Text>
              <Text style={styles.infoValue}>
                {jump.delay_seconds ? `${jump.delay_seconds} sec` : "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{jump.jump_date || "N/A"}</Text>
            </View>
          </Card.Content>
        </Card>

        {jump.details && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionLabel}>Details</Text>
              <Text style={styles.detailsText}>
                {jump.details || "No details provided"}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Button
          style={styles.deleteButton}
          mode="contained"
          buttonColor="#dc3545"
          textColor="#fff"
          onPress={handleDeleteJump}
          disabled={deleteJumpMutation.isPending}
          labelStyle={{ fontSize: 15, fontWeight: "600" }}
        >
          {deleteJumpMutation.isPending ? "Deleting..." : "Delete Jump"}
        </Button>
        <APIErrorHandler
          error={error || jumpsError}
          onDismiss={() => setError(null)}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 20,
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  locationName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#444",
  },
  noJumpContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
  deleteButton: {
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export default JumpDetails;
