import { Stack } from "expo-router";

import { ProductSwitcher } from "@/components/ProductSwitcher";
import { Colors } from "@/constants/Colors";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => <ProductSwitcher />,
        headerLeftContainerStyle: {
          paddingLeft: 16,
        },
        headerTitle: "",
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="finance" />
      <Stack.Screen name="sales" />
      <Stack.Screen name="team" />
      <Stack.Screen name="projects" />
      <Stack.Screen name="more" />
    </Stack>
  );
}
