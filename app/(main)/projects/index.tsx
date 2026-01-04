import { View, Text } from "react-native";

export default function ProjectsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Projects</Text>
      <Text className="mt-2 text-muted-foreground">
        Projects, Tasks, Milestones
      </Text>
    </View>
  );
}

