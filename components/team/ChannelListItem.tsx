import { View, Text, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Colors from "@/constants/Colors";
import {
  ChannelWithMembership,
  formatMessageTime,
  CHANNEL_TYPE_ICONS,
} from "@/lib/types/team";

interface ChannelListItemProps {
  channel: ChannelWithMembership;
  onPress: () => void;
  isActive?: boolean;
}

export function ChannelListItem({
  channel,
  onPress,
  isActive = false,
}: ChannelListItemProps) {
  const isPrivate = channel.type === "private";
  const isStarred = channel.membership?.is_starred;
  const isMuted = channel.membership?.is_muted;
  const unreadCount = channel.unread_count || 0;
  const hasUnread = unreadCount > 0;

  return (
    <Pressable
      className={`mb-2 flex-row items-center rounded-xl p-3 ${
        isActive ? "bg-primary/10" : "bg-muted"
      } active:opacity-70`}
      onPress={onPress}
    >
      {/* Channel Icon */}
      <View
        className={`h-10 w-10 items-center justify-center rounded-lg ${
          isActive ? "bg-primary" : "bg-background"
        }`}
      >
        <FontAwesome
          name={isPrivate ? "lock" : "hashtag"}
          size={16}
          color={isActive ? "white" : Colors.foreground}
        />
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
            {channel.name}
          </Text>
          {/* Star indicator */}
          {isStarred && (
            <FontAwesome
              name="star"
              size={12}
              color={Colors.warning}
              style={{ marginLeft: 4 }}
            />
          )}
          {/* Muted indicator */}
          {isMuted && (
            <FontAwesome
              name="bell-slash"
              size={12}
              color={Colors.mutedForeground}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>

        {/* Description or last message */}
        <View className="flex-row items-center">
          <Text
            className="flex-1 text-sm text-muted-foreground"
            numberOfLines={1}
          >
            {channel.last_message_preview || channel.description || `${channel.member_count} members`}
          </Text>
          {channel.last_message_at && (
            <Text className="ml-2 text-xs text-muted-foreground">
              {formatMessageTime(channel.last_message_at)}
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
