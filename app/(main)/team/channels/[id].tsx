import { useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

import { Colors } from "@/constants/Colors";
import {
  useChannel,
  useChannelMessages,
  useSendChannelMessage,
} from "@/lib/hooks/useTeam";
import { useChannelSubscription, useTeam } from "@/providers/team-provider";
import { Message } from "@/lib/types/team";
import { MessageList } from "@/components/team/MessageList";
import { MessageInput } from "@/components/team/MessageInput";
import { ChannelHeader } from "@/components/team/ChannelHeader";

export default function ChannelViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Hide parent header (main layout)
  useLayoutEffect(() => {
    // Navigate up: screen -> team Stack -> main Stack
    const parent = navigation.getParent(); // team Stack
    const grandparent = parent?.getParent(); // main Stack

    // Try setting on the team screen within main Stack
    grandparent?.setOptions({ headerShown: false });

    return () => {
      grandparent?.setOptions({ headerShown: true });
    };
  }, [navigation]);

  // Subscribe to real-time updates
  useChannelSubscription(id);

  // Typing indicator
  const { sendTyping, getTypingIndicator } = useTeam();
  const typingText = id ? getTypingIndicator(id) : "";

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

  const handleMembersPress = useCallback(() => {
    // TODO: Show members modal
    console.log("Show members");
  }, []);

  const handleSettingsPress = useCallback(() => {
    // TODO: Show settings modal
    console.log("Show settings");
  }, []);

  const handleHuddlePress = useCallback(() => {
    // TODO: Start huddle
    console.log("Start huddle");
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
    if (id) {
      sendTyping(id, false);
    }
  }, [id, sendTyping]);

  const handleAttachmentPress = useCallback(() => {
    // TODO: Open attachment picker
    console.log("Open attachment picker");
  }, []);

  const handleMicrophonePress = useCallback(() => {
    // TODO: Start voice recording
    console.log("Start voice recording");
  }, []);

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Channel not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? -20 : 0}
      >
        {/* Header */}
        {channel ? (
          <ChannelHeader
            channel={channel}
            memberCount={members.length}
            onBack={handleBack}
            onMembersPress={handleMembersPress}
            onSettingsPress={handleSettingsPress}
            onHuddlePress={handleHuddlePress}
          />
        ) : (
          <View className="flex-row items-center border-b border-border px-4 py-3">
            <Pressable
              className="mr-3 h-8 w-8 items-center justify-center rounded-full active:bg-muted"
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={24} color="#0f172a" />
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

        {/* Typing Indicator */}
        {typingText ? (
          <View className="px-4 py-1">
            <Text className="text-sm italic text-muted-foreground">
              {typingText}
            </Text>
          </View>
        ) : null}

        {/* Message Input */}
        <MessageInput
          channelId={id}
          channelName={channel?.name}
          onSend={handleSend}
          onTyping={handleTyping}
          onAttachmentPress={handleAttachmentPress}
          onMicrophonePress={handleMicrophonePress}
          disabled={sendMessageMutation.isPending}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
