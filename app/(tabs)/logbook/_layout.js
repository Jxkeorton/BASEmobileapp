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
            name="JumpDetails"
            options={{
                title: "Jump details",
            }}
        />
    </Stack>
    )
};