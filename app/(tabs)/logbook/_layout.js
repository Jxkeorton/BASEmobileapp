import { Stack} from "expo-router";

export default () => {
    return (
    <Stack >
        <Stack.Screen
            name="LogBook"
            options={{
                title: "Logbook",
            }}
        />
        <Stack.Screen
            name="[jumpindex]"
            options={{
                title: "Jump details",
            }}
        />
    </Stack>
    )
};