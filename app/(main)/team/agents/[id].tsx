import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import Colors from "@/constants/Colors";
import { useAgent } from "@/lib/hooks/useTeam";
import { useAgentChat } from "@/lib/hooks/useAgentChat";
import { AgentMessage as AgentMessageType } from "@/lib/types/team";
import { MessageInput } from "@/components/team/MessageInput";
import { AgentMessage } from "@/components/team/AgentMessage";

export default function AgentChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // Fetch agent details
  const { data: agent, isLoading: agentLoading } = useAgent(id);

  // Chat state
  const {
    messages,
    isStreaming,
    sendMessage,
    startNewConversation,
    error,
  } = useAgentChat({
    agentId: id,
    onError: (err) => {
      Alert.alert("Error", err.message);
    },
  });

  // Handlers
  const handleBack = () => {
    router.back();
  };

  const handleSend = useCallback(
    async (content: string) => {
      await sendMessage(content);
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [sendMessage]
  );

  const handleTyping = useCallback(() => {
    // No typing indicator for agent chat
  }, []);

  const handleNewChat = useCallback(() => {
    Alert.alert(
      "New Conversation",
      "Start a new conversation with this agent?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start New",
          onPress: startNewConversation,
        },
      ]
    );
  }, [startNewConversation]);

  const renderMessage = useCallback(
    ({ item, index }: { item: AgentMessageType; index: number }) => {
      const isLastMessage = index === messages.length - 1;
      return (
        <AgentMessage
          message={item}
          agentName={agent?.name || "Assistant"}
          agentEmoji={agent?.emoji || "🤖"}
          isStreaming={isLastMessage && isStreaming && item.role === "assistant"}
        />
      );
    },
    [agent, messages.length, isStreaming]
  );

  if (!id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Agent not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View className="flex-row items-center border-b border-border px-4 py-3">
          <Pressable
            className="mr-3 h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            onPress={handleBack}
          >
            <FontAwesome
              name="chevron-left"
              size={16}
              color={Colors.foreground}
            />
          </Pressable>

          {agentLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : agent ? (
            <>
              {/* Agent avatar */}
              <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Text className="text-xl">{agent.emoji}</Text>
              </View>

              {/* Agent info */}
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-foreground">
                  {agent.name}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  AI Assistant
                </Text>
              </View>
            </>
          ) : (
            <Text className="text-muted-foreground">Loading...</Text>
          )}

          {/* New chat button */}
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            onPress={handleNewChat}
          >
            <FontAwesome name="plus" size={16} color={Colors.foreground} />
          </Pressable>
        </View>

        {/* Messages */}
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            {agent && (
              <>
                <View className="h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                  <Text className="text-5xl">{agent.emoji}</Text>
                </View>
                <Text className="mt-4 text-xl font-semibold text-foreground">
                  {agent.name}
                </Text>
                <Text className="mt-2 text-center text-muted-foreground">
                  {agent.description}
                </Text>

                {/* Suggested prompts */}
                <View className="mt-6 w-full">
                  <Text className="mb-2 text-center text-sm font-medium text-muted-foreground">
                    Try asking:
                  </Text>
                  <View className="gap-2">
                    {getSuggestedPrompts(agent.capabilities).map(
                      (prompt, index) => (
                        <Pressable
                          key={index}
                          className="rounded-xl border border-border bg-background px-4 py-3 active:bg-muted"
                          onPress={() => handleSend(prompt)}
                        >
                          <Text className="text-center text-foreground">
                            {prompt}
                          </Text>
                        </Pressable>
                      )
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `${item.role}-${index}`}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          />
        )}

        {/* Input */}
        <MessageInput
          placeholder={`Ask ${agent?.name || "the assistant"}...`}
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={isStreaming}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helper to generate suggested prompts based on agent capabilities
function getSuggestedPrompts(capabilities: string[]): string[] {
  const prompts: string[] = [];

  if (capabilities.includes("finance") || capabilities.includes("budgets")) {
    prompts.push("What's my budget status this month?");
  }
  if (capabilities.includes("sales") || capabilities.includes("leads")) {
    prompts.push("Show me my top leads");
  }
  if (capabilities.includes("projects") || capabilities.includes("tasks")) {
    prompts.push("What tasks are due this week?");
  }
  if (capabilities.includes("analytics") || capabilities.includes("reports")) {
    prompts.push("Generate a summary report");
  }

  // Default prompts if no specific capabilities
  if (prompts.length === 0) {
    prompts.push(
      "What can you help me with?",
      "Show me recent activity",
      "Help me with a task"
    );
  }

  return prompts.slice(0, 3);
}
