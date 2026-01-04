import { View, Text, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Colors from "@/constants/Colors";
import { Channel } from "@/lib/types/team";

interface ChannelHeaderProps {
  channel: Channel;
  memberCount: number;
  onBack: () => void;
  onMembersPress: () => void;
  onSettingsPress: () => void;
  onStarToggle: () => void;
  onMuteToggle: () => void;
  isStarred?: boolean;
  isMuted?: boolean;
}

export function ChannelHeader({
  channel,
  memberCount,
  onBack,
  onMembersPress,
  onSettingsPress,
  onStarToggle,
  onMuteToggle,
  isStarred = false,
  isMuted = false,
}: ChannelHeaderProps) {
  const isPrivate = channel.type === "private";

  return (
    <View className="border-b border-border bg-background">
      <View className="flex-row items-center px-4 py-3">
        {/* Back Button */}
        <Pressable
          className="mr-3 h-8 w-8 items-center justify-center rounded-full active:bg-muted"
          onPress={onBack}
        >
          <FontAwesome
            name="chevron-left"
            size={16}
            color={Colors.foreground}
          />
        </Pressable>

        {/* Channel Icon */}
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <FontAwesome
            name={isPrivate ? "lock" : "hashtag"}
            size={16}
            color={Colors.foreground}
          />
        </View>

        {/* Channel Info */}
        <Pressable className="ml-3 flex-1" onPress={onMembersPress}>
          <View className="flex-row items-center">
            <Text className="text-lg font-semibold text-foreground">
              {channel.name}
            </Text>
            {isStarred && (
              <FontAwesome
                name="star"
                size={12}
                color={Colors.warning}
                style={{ marginLeft: 6 }}
              />
            )}
            {isMuted && (
              <FontAwesome
                name="bell-slash"
                size={12}
                color={Colors.mutedForeground}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
          <Text className="text-sm text-muted-foreground">
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </Text>
        </Pressable>

        {/* Actions */}
        <View className="flex-row items-center gap-2">
          {/* Star Toggle */}
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            onPress={onStarToggle}
          >
            <FontAwesome
              name={isStarred ? "star" : "star-o"}
              size={18}
              color={isStarred ? Colors.warning : Colors.mutedForeground}
            />
          </Pressable>

          {/* Mute Toggle */}
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            onPress={onMuteToggle}
          >
            <FontAwesome
              name={isMuted ? "bell-slash" : "bell-o"}
              size={18}
              color={isMuted ? Colors.mutedForeground : Colors.mutedForeground}
            />
          </Pressable>

          {/* Settings */}
          <Pressable
            className="h-8 w-8 items-center justify-center rounded-full active:bg-muted"
            onPress={onSettingsPress}
          >
            <FontAwesome name="cog" size={18} color={Colors.mutedForeground} />
          </Pressable>
        </View>
      </View>

      {/* Topic (if set) */}
      {channel.topic && (
        <View className="border-t border-border px-4 py-2">
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            {channel.topic}
          </Text>
        </View>
      )}
    </View>
  );
}
