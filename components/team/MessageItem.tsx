import { memo } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Colors from "@/constants/Colors";
import { Message, formatMessageTimestamp } from "@/lib/types/team";
import { ReactionBar } from "./ReactionBar";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  isInThread?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onThreadPress: () => void;
  onReactionPress: (emoji: string) => void;
}

function MessageItemComponent({
  message,
  isOwn,
  showAvatar,
  showTimestamp,
  isInThread = false,
  onPress,
  onLongPress,
  onThreadPress,
  onReactionPress,
}: MessageItemProps) {
  const hasReactions = message.reactions && message.reactions.length > 0;
  const hasThread = message.reply_count > 0 && !isInThread;
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const isEdited = message.is_edited;
  const isPinned = message.is_pinned;
  const isSystem = message.type === "system";

  // System messages render differently
  if (isSystem) {
    return (
      <View className="my-2 flex-row items-center justify-center">
        <Text className="text-sm italic text-muted-foreground">
          {message.content}
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      className={`mb-1 flex-row ${showAvatar ? "mt-2" : ""}`}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {/* Avatar placeholder */}
      <View className="mr-3 w-9">
        {showAvatar && (
          <View className="h-9 w-9 items-center justify-center rounded-full bg-muted">
            {message.user?.avatar_url ? (
              <Image
                source={{ uri: message.user.avatar_url }}
                className="h-9 w-9 rounded-full"
              />
            ) : (
              <FontAwesome
                name="user"
                size={16}
                color={Colors.mutedForeground}
              />
            )}
          </View>
        )}
      </View>

      {/* Message Content */}
      <View className="flex-1">
        {/* Header (name + timestamp) */}
        {showTimestamp && (
          <View className="mb-1 flex-row items-center">
            <Text className="font-semibold text-foreground">
              {message.user?.name || "Unknown"}
            </Text>
            <Text className="ml-2 text-xs text-muted-foreground">
              {formatMessageTimestamp(message.created_at)}
            </Text>
            {isPinned && (
              <View className="ml-2 flex-row items-center">
                <FontAwesome
                  name="thumb-tack"
                  size={10}
                  color={Colors.primary}
                />
                <Text className="ml-1 text-xs text-primary">Pinned</Text>
              </View>
            )}
          </View>
        )}

        {/* Message text */}
        <View className="flex-row flex-wrap">
          <Text className="text-foreground">
            {message.content}
            {isEdited && (
              <Text className="text-xs text-muted-foreground"> (edited)</Text>
            )}
          </Text>
        </View>

        {/* Attachments */}
        {hasAttachments && (
          <View className="mt-2">
            {message.attachments.map((attachment) => (
              <View
                key={attachment.id}
                className="mb-2 overflow-hidden rounded-lg"
              >
                {attachment.type === "image" ? (
                  <Pressable>
                    <Image
                      source={{ uri: attachment.thumbnail || attachment.url }}
                      className="h-48 w-full rounded-lg"
                      resizeMode="cover"
                    />
                  </Pressable>
                ) : (
                  <View className="flex-row items-center rounded-lg bg-muted p-3">
                    <FontAwesome
                      name="file-o"
                      size={20}
                      color={Colors.primary}
                    />
                    <View className="ml-3 flex-1">
                      <Text
                        className="font-medium text-foreground"
                        numberOfLines={1}
                      >
                        {attachment.name}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </Text>
                    </View>
                    <FontAwesome
                      name="download"
                      size={16}
                      color={Colors.primary}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Reactions */}
        {hasReactions && (
          <ReactionBar
            reactions={message.reactions}
            onReactionPress={onReactionPress}
            onAddReaction={() => onReactionPress("")}
          />
        )}

        {/* Thread indicator */}
        {hasThread && (
          <Pressable
            className="mt-2 flex-row items-center"
            onPress={onThreadPress}
          >
            <FontAwesome name="reply" size={12} color={Colors.primary} />
            <Text className="ml-2 text-sm font-medium text-primary">
              {message.reply_count} {message.reply_count === 1 ? "reply" : "replies"}
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

// Format file size helper
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// Memoize to prevent unnecessary re-renders
export const MessageItem = memo(MessageItemComponent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.is_edited === nextProps.message.is_edited &&
    prevProps.message.is_pinned === nextProps.message.is_pinned &&
    prevProps.message.reply_count === nextProps.message.reply_count &&
    prevProps.message.reactions === nextProps.message.reactions &&
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.showTimestamp === nextProps.showTimestamp
  );
});
