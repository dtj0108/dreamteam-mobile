import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import Colors from "@/constants/Colors";
import {
  useDMConversation,
  useDMMessages,
  useSendDMMessage,
  useToggleMuteDM,
} from "@/lib/hooks/useTeam";
import { useDMSubscription } from "@/providers/team-provider";
import { Message, getMemberDisplayName } from "@/lib/types/team";
import { MessageList } from "@/components/team/MessageList";
import { MessageInput } from "@/components/team/MessageInput";
import { PresenceIndicator } from "@/components/team/PresenceIndicator";

export default function DMViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Subscribe to real-time updates
  useDMSubscription(id);

  // Fetch DM and messages
  const { data: dm, isLoading: dmLoading } = useDMConversation(id);
  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDMMessages(id, { limit: 50 });

  // Mutations
  const sendMessageMutation = useSendDMMessage();
  const toggleMuteMutation = useToggleMuteDM();

  const participant = dm?.participant;

  // Flatten paginated messages
  const messages =
    messagesData?.pages.flatMap((page) => page.messages).reverse() || [];

  const isLoading = dmLoading || messagesLoading;

  // Handlers
  const handleBack = () => {
    router.back();
  };

  const handleSend = useCallback(
    async (content: string) => {
      if (!id || !content.trim()) return;

      await sendMessageMutation.mutateAsync({
        dmId: id,
        data: { content: content.trim() },
      });
    },
    [id, sendMessageMutation]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleMuteToggle = useCallback(() => {
    if (!id) return;
    toggleMuteMutation.mutate({ id, isMuted: dm?.is_muted || false });
  }, [id, dm, toggleMuteMutation]);

  const handleMessagePress = useCallback((message: Message) => {
    console.log("Message pressed:", message.id);
  }, []);

  const handleThreadPress = useCallback((message: Message) => {
    console.log("Thread pressed:", message.id);
  }, []);

  const handleReactionPress = useCallback(
    (message: Message, emoji: string) => {
      console.log("Reaction pressed:", message.id, emoji);
    },
    []
  );

  const handleTyping = useCallback(() => {
    // Typing indicator handled by provider
  }, []);

  if (!id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Conversation not found</Text>
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

          {participant ? (
            <>
              {/* Avatar with presence */}
              <View className="relative">
                {participant.user.avatar_url ? (
                  <Image
                    source={{ uri: participant.user.avatar_url }}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <FontAwesome
                      name="user"
                      size={16}
                      color={Colors.mutedForeground}
                    />
                  </View>
                )}
                {participant.presence && (
                  <View className="absolute -bottom-0.5 -right-0.5">
                    <PresenceIndicator
                      status={participant.presence.status}
                      size="sm"
                    />
                  </View>
                )}
              </View>

              {/* User Info */}
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-foreground">
                  {getMemberDisplayName(participant)}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {participant.presence?.status_message ||
                    (participant.presence?.status === "online"
                      ? "Online"
                      : participant.presence?.status === "away"
                      ? "Away"
                      : participant.presence?.status === "dnd"
                      ? "Do Not Disturb"
                      : "Offline")}
                </Text>
              </View>

              {/* Actions */}
              <Pressable
                className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
                onPress={handleMuteToggle}
              >
                <FontAwesome
                  name={dm?.is_muted ? "bell-slash" : "bell-o"}
                  size={18}
                  color={Colors.mutedForeground}
                />
              </Pressable>
            </>
          ) : (
            <ActivityIndicator size="small" color={Colors.primary} />
          )}
        </View>

        {/* Messages */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <MessageList
            messages={messages}
            dmId={id}
            onMessagePress={handleMessagePress}
            onThreadPress={handleThreadPress}
            onReactionPress={handleReactionPress}
            onLoadMore={handleLoadMore}
            isLoadingMore={isFetchingNextPage}
            hasMore={hasNextPage || false}
          />
        )}

        {/* Message Input */}
        <MessageInput
          dmId={id}
          placeholder={`Message ${
            participant ? getMemberDisplayName(participant) : "..."
          }`}
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={sendMessageMutation.isPending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
