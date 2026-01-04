import { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  ListRenderItem,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Colors from "@/constants/Colors";
import {
  Message,
  isConsecutiveMessage,
  shouldShowDateSeparator,
  formatDateSeparator,
} from "@/lib/types/team";
import { useAuth } from "@/providers/auth-provider";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  channelId?: string;
  dmId?: string;
  threadId?: string;
  onMessagePress: (message: Message) => void;
  onThreadPress: (message: Message) => void;
  onReactionPress: (message: Message, emoji: string) => void;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  hasMore: boolean;
}

export function MessageList({
  messages,
  channelId,
  dmId,
  threadId,
  onMessagePress,
  onThreadPress,
  onReactionPress,
  onLoadMore,
  isLoadingMore,
  hasMore,
}: MessageListProps) {
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Handle scroll to determine if we should show "scroll to bottom" button
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      // Show button if scrolled more than 200px from bottom
      // In inverted list, this means scrolled up
      setShowScrollButton(offsetY > 200);
    },
    []
  );

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowScrollButton(false);
  }, []);

  const renderItem: ListRenderItem<Message> = useCallback(
    ({ item, index }) => {
      const previousMessage = messages[index + 1]; // +1 because list is inverted
      const isOwn = item.user_id === user?.id;
      const showAvatar = !isConsecutiveMessage(item, previousMessage);
      const showDateSeparator = shouldShowDateSeparator(item, previousMessage);

      return (
        <>
          <MessageItem
            message={item}
            isOwn={isOwn}
            showAvatar={showAvatar}
            showTimestamp={showAvatar}
            isInThread={!!threadId}
            onPress={() => onMessagePress(item)}
            onLongPress={() => onMessagePress(item)}
            onThreadPress={() => onThreadPress(item)}
            onReactionPress={(emoji) => onReactionPress(item, emoji)}
          />
          {showDateSeparator && (
            <View className="my-4 flex-row items-center">
              <View className="h-px flex-1 bg-border" />
              <Text className="mx-4 text-xs font-medium text-muted-foreground">
                {formatDateSeparator(item.created_at)}
              </Text>
              <View className="h-px flex-1 bg-border" />
            </View>
          )}
        </>
      );
    },
    [
      messages,
      user?.id,
      threadId,
      onMessagePress,
      onThreadPress,
      onReactionPress,
    ]
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    return (
      <View
        className="flex-1 items-center justify-center py-12"
        style={{ transform: [{ scaleY: -1 }] }}
      >
        <FontAwesome name="comments-o" size={48} color="#d1d5db" />
        <Text className="mt-4 text-lg font-medium text-foreground">
          No messages yet
        </Text>
        <Text className="mt-1 text-center text-muted-foreground">
          Be the first to send a message!
        </Text>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        inverted
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          flexGrow: 1,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={hasMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Pressable
          className="absolute bottom-4 right-4 h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg active:opacity-70"
          onPress={scrollToBottom}
        >
          <FontAwesome name="chevron-down" size={16} color="white" />
        </Pressable>
      )}
    </View>
  );
}
