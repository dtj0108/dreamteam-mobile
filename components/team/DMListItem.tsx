import { View, Text, Pressable, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Colors from "@/constants/Colors";
import {
  DirectMessageConversation,
  formatMessageTime,
  getMemberDisplayName,
} from "@/lib/types/team";
import { PresenceIndicator } from "./PresenceIndicator";

interface DMListItemProps {
  conversation: DirectMessageConversation;
  onPress: () => void;
}

export function DMListItem({ conversation, onPress }: DMListItemProps) {
  const participant = conversation.participant;
  const unreadCount = conversation.unread_count || 0;
  const hasUnread = unreadCount > 0;
  const isMuted = conversation.is_muted;

  if (!participant) {
    return null;
  }

  return (
    <Pressable
      className="mb-2 flex-row items-center rounded-xl bg-muted p-3 active:opacity-70"
      onPress={onPress}
    >
      {/* Avatar with presence */}
      <View className="relative">
        {participant.user.avatar_url ? (
          <Image
            source={{ uri: participant.user.avatar_url }}
            className="h-12 w-12 rounded-full"
          />
        ) : (
          <View className="h-12 w-12 items-center justify-center rounded-full bg-background">
            <FontAwesome name="user" size={20} color={Colors.mutedForeground} />
          </View>
        )}
        {participant.presence && (
          <View className="absolute -bottom-0.5 -right-0.5">
            <PresenceIndicator status={participant.presence.status} size="sm" />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <Text
            className={`flex-1 font-semibold ${
              hasUnread ? "text-foreground" : "text-foreground"
            }`}
            numberOfLines={1}
          >
            {getMemberDisplayName(participant)}
          </Text>
          {isMuted && (
            <FontAwesome
              name="bell-slash"
              size={12}
              color={Colors.mutedForeground}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>

        {/* Last message or status */}
        <View className="flex-row items-center">
          <Text
            className={`flex-1 text-sm ${
              hasUnread ? "text-foreground" : "text-muted-foreground"
            }`}
            numberOfLines={1}
          >
            {conversation.last_message?.content ||
              participant.presence?.status_message ||
              participant.user.email}
          </Text>
          {conversation.last_message_at && (
            <Text className="ml-2 text-xs text-muted-foreground">
              {formatMessageTime(conversation.last_message_at)}
            </Text>
          )}
        </View>
      </View>

      {/* Unread Badge */}
      {hasUnread && (
        <View className="ml-2 min-w-[24px] items-center justify-center rounded-full bg-primary px-2 py-1">
          <Text className="text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}

      {/* Chevron */}
      {!hasUnread && (
        <FontAwesome
          name="chevron-right"
          size={12}
          color={Colors.mutedForeground}
          style={{ marginLeft: 8 }}
        />
      )}
    </Pressable>
  );
}
