import { Stack } from "expo-router";

export default function TeamLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="channels/[id]" />
      <Stack.Screen name="channels/new" />
      <Stack.Screen name="dm/[id]" />
      <Stack.Screen name="agents/[id]" />
      <Stack.Screen name="messages" />
    </Stack>
  );
}
