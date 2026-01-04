import { View, Text } from "react-native";

export default function KnowledgeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">Knowledge</Text>
      <Text className="mt-2 text-muted-foreground">
        Documents, Categories, Whiteboards
      </Text>
    </View>
  );
}

