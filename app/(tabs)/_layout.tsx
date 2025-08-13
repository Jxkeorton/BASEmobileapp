import { Tabs } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";

export default () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#00ABF0",
        tabBarStyle: { backgroundColor: "black", height: 100 },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          tabBarIcon: ({ color }) => (
            <Entypo name="pin" size={24} color={color} />
          ),
          title: "Map",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="logbook"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="list" size={24} color={color} />
          ),
          title: "Logbook",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
};
