import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Icon,
  Label,
  NativeTabs,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="map">
        <Label>Map</Label>
        {Platform.select({
          ios: <Icon sf={{ default: "map", selected: "map.fill" }} />,
          android: (
            <Icon
              src={<VectorIcon family={MaterialIcons} name="location-pin" />}
            />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="logbook">
        <Label>Logbook</Label>
        {Platform.select({
          ios: (
            <Icon sf={{ default: "list.bullet", selected: "list.bullet" }} />
          ),
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="list" />} />
          ),
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Profile</Label>
        {Platform.select({
          ios: (
            <Icon
              sf={{ default: "person.circle", selected: "person.circle.fill" }}
            />
          ),
          android: (
            <Icon src={<VectorIcon family={MaterialIcons} name="person" />} />
          ),
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
