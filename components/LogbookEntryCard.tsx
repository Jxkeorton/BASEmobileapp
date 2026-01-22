import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "../providers/SessionProvider";
import { useKyClient } from "../services/kyClient";
import { paths } from "../types/api";

interface LogbookJumpCardProps {
  jumpNumber: number;
}

export type LogbookJump = NonNullable<
  paths["/logbook"]["get"]["responses"]["200"]["content"]["application/json"]["data"]
>["entries"][number];

const LogbookJumpCard = ({ jumpNumber }: LogbookJumpCardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const client = useKyClient();

  const {
    data: logbookResponse,
    isLoading: loadingLogbook,
    isError,
    error,
  } = useQuery({
    queryKey: ["logbook", user?.id],
    queryFn: async () => {
      const res = await client.GET("/logbook");
      if ("error" in res) throw res.error;
      return res.data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    retry: 3,
  });

  const jumps = useMemo(() => {
    return logbookResponse?.success
      ? logbookResponse.data?.entries
      : ([] as LogbookJump[]);
  }, [logbookResponse]);

  const processedJumps = useMemo(() => {
    if (jumps && !jumps.length) return [];

    // Reverse to show newest first and add jump numbers
    const reversedJumps = [...(jumps || [])].reverse();
    return reversedJumps.map((jump, index) => ({
      ...jump,
      jumpNumber: jumpNumber - index,
    }));
  }, [jumps, jumpNumber]);

  const filteredJumps = useMemo(() => {
    if (!searchTerm) return processedJumps;

    const searchLower = searchTerm.toLowerCase();
    return processedJumps.filter((jump) => {
      const jumpNumberMatch = jump.jumpNumber?.toString().includes(searchTerm);
      const locationMatch = jump.location_name
        ?.toLowerCase()
        .includes(searchLower);
      return jumpNumberMatch || locationMatch;
    });
  }, [processedJumps, searchTerm]);

  const onCardPress = (index: number) => {
    router.navigate({
      pathname: `/(tabs)/logbook/${index}`,
      params: { jumpNumber: jumpNumber - index },
    });
  };

  if (isError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Error loading jumps: {error.message}
        </Text>
      </View>
    );
  }

  if (loadingLogbook) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ABF0" />
        <Text style={styles.loadingText}>Loading jumps...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.searchBox}>
        <View style={styles.textInputContainer}>
          <TextInput
            placeholder="Search Jumps"
            placeholderTextColor="#666"
            autoCapitalize="none"
            style={styles.searchInput}
            onChangeText={(text) => setSearchTerm(text)}
            value={searchTerm}
          />
        </View>
      </View>

      {filteredJumps.length > 0 ? (
        filteredJumps.map((jump, index) => (
          <TouchableOpacity
            key={jump.id || index}
            style={styles.jumpCard}
            onPress={() => onCardPress(index)}
          >
            <View style={styles.backgroundImage}>
              <View style={styles.jumpCardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.contentText}>{jump.jumpNumber}</Text>
                  {jump.jump_date && (
                    <Text style={styles.dateText}>{jump.jump_date}</Text>
                  )}
                </View>
                <Text style={styles.locationTextWhite}>
                  {jump.location_name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyMessage}>
          {searchTerm ? (
            <Text style={styles.emptyMessageText}>
              No jumps found matching &quot;{searchTerm}&quot;
            </Text>
          ) : (
            <>
              <Text style={styles.emptyMessageText}>
                Add jumps using the + button
              </Text>
              <Text style={[styles.emptyMessageText, { marginTop: 30 }]}>
                You can edit the total jump number within your profile/edit
                profile.
              </Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "transparent",
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  jumpCard: {
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  backgroundImage: {
    height: 75,
    justifyContent: "flex-end",
    backgroundColor: "#fff",
  },
  jumpCardContent: {
    padding: 12,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  contentText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  locationTextWhite: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  emptyMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyMessageText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default LogbookJumpCard;
