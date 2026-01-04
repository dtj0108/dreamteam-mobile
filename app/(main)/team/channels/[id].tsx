import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import Colors from "@/constants/Colors";
import {
  useChannel,
  useChannelMessages,
  useSendChannelMessage,
  useToggleStarChannel,
  useToggleMuteChannel,
} from "@/lib/hooks/useTeam";
import { useChannelSubscription } from "@/providers/team-provider";
import { Message } from "@/lib/types/team";
import { MessageList } from "@/components/team/MessageList";
import { MessageInput } from "@/components/team/MessageInput";
import { ChannelHeader } from "@/components/team/ChannelHeader";

export default function ChannelViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Subscribe to real-time updates
  useChannelSubscription(id);

  // Fetch channel and messages
  const { data: channelData, isLoading: channelLoading } = useChannel(id);
  const {
    data: messagesData,
    isLoading: messagesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChannelMessages(id, { limit: 50 });

  // Mutations
  const sendMessageMutation = useSendChannelMessage();
  const toggleStarMutation = useToggleStarChannel();
  const toggleMuteMutation = useToggleMuteChannel();

  const channel = channelData?.channel;
  const members = channelData?.members || [];

  // Flatten paginated messages
  const messages =
    messagesData?.pages.flatMap((page) => page.messages).reverse() || [];

  const isLoading = channelLoading || messagesLoading;

  // Handlers
  const handleBack = () => {
    router.back();
  };

  const handleSend = useCallback(
    async (content: string) => {
      if (!id || !content.trim()) return;

      await sendMessageMutation.mutateAsync({
        channelId: id,
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

  const handleStarToggle = useCallback(() => {
    if (!id || !channel) return;
    // We would need to fetch membership info for this
    toggleStarMutation.mutate({ id, isStarred: false });
  }, [id, channel, toggleStarMutation]);

  const handleMuteToggle = useCallback(() => {
    if (!id || !channel) return;
    toggleMuteMutation.mutate({ id, isMuted: false });
  }, [id, channel, toggleMuteMutation]);

  const handleMembersPress = useCallback(() => {
    // TODO: Show members modal
    console.log("Show members");
  }, []);

  const handleSettingsPress = useCallback(() => {
    // TODO: Show settings modal
    console.log("Show settings");
  }, []);

  const handleMessagePress = useCallback((message: Message) => {
    // TODO: Show message actions
    console.log("Message pressed:", message.id);
  }, []);

  const handleThreadPress = useCallback((message: Message) => {
    // TODO: Open thread panel
    console.log("Thread pressed:", message.id);
  }, []);

  const handleReactionPress = useCallback(
    (message: Message, emoji: string) => {
      // TODO: Toggle reaction
      console.log("Reaction pressed:", message.id, emoji);
    },
    []
  );

  const handleTyping = useCallback(() => {
    // Typing indicator is handled by the provider
  }, []);

  if (!id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Channel not found</Text>
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
        {channel ? (
          <ChannelHeader
            channel={channel}
            memberCount={members.length}
            onBack={handleBack}
            onMembersPress={handleMembersPress}
            onSettingsPress={handleSettingsPress}
            onStarToggle={handleStarToggle}
            onMuteToggle={handleMuteToggle}
          />
        ) : (
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
            {isLoading && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>
        )}

        {/* Messages */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <MessageList
            messages={messages}
            channelId={id}
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
          channelId={id}
          placeholder={`Message #${channel?.name || "channel"}`}
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={sendMessageMutation.isPending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
