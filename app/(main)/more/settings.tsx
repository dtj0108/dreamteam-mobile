import { View, Text, Pressable } from "react-native";

import { useAuth } from "@/providers/auth-provider";

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-foreground">Settings</Text>
      <Text className="mt-2 text-muted-foreground">
        App preferences and account settings
      </Text>

      <Pressable
        onPress={signOut}
        className="mt-8 rounded-lg bg-destructive p-4"
      >
        <Text className="text-center font-semibold text-destructive-foreground">
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
}

