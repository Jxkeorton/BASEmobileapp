import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ABF0" />
        <Text style={styles.loadingText}>
          {deleteJumpMutation.isPending
            ? "Deleting jump..."
            : "Loading jump details..."}
        </Text>
      </View>
    );
  }

  if (!jump) {
    return (
      <View style={styles.noJumpContainer}>
        <Text style={{ fontSize: 25 }}>
          Cannot fetch jump details. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Jump {jumpNumber || "N/A"}
      </Text>
      <Card style={styles.card}>
        <Card.Content>
          {jump.location_name && (
            <View>
              <Text variant="titleLarge" style={styles.title}>
                {jump.location_name.toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.mainContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitleText}>Exit Type: </Text>
              <Text style={styles.subtitleText}>Delay: </Text>
              <Text style={styles.subtitleText}>Date: </Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.text}>{jump.exit_type || "N/A"}</Text>
              <Text style={styles.text}>
                {jump.delay_seconds ? `${jump.delay_seconds} sec` : "N/A"}
              </Text>
              <Text style={styles.text}>{jump.jump_date || "N/A"}</Text>
            </View>
          </View>

          <Text style={styles.subtitleText}>Details: </Text>
          <Text variant="bodyMedium" style={styles.text}>
            {jump.details || "No details provided"}
          </Text>
        </Card.Content>
      </Card>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f6f6f6",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  image: {
    width: "48%",
    aspectRatio: 1,
    marginBottom: 8,
  },
  text: {
    marginBottom: 10,
    fontSize: 15,
    paddingLeft: 10,
    color: "#333",
  },
  subtitleText: {
    marginBottom: 10,
    paddingLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  mainContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  textContainer: {
    width: "60%",
  },
  subtitleContainer: {
    width: "40%",
    alignItems: "flex-start",
  },
  noJumpContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: "#666",
  },
  deleteButton: {
    marginTop: 24,
    marginBottom: 10,
    borderRadius: 8,
  },
});

export default JumpDetails;
