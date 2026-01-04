import { useState, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

import Colors from "@/constants/Colors";

interface MessageInputProps {
  channelId?: string;
  dmId?: string;
  threadId?: string;
  placeholder?: string;
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
  disabled?: boolean;
}

export function MessageInput({
  channelId,
  dmId,
  threadId,
  placeholder = "Type a message...",
  onSend,
  onTyping,
  disabled = false,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canSend = content.trim().length > 0 && !disabled && !isSending;

  const handleChangeText = useCallback(
    (text: string) => {
      setContent(text);

      // Debounce typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        onTyping();
      }, 300);
    },
    [onTyping]
  );

  const handleSend = useCallback(async () => {
    if (!canSend) return;

    const messageContent = content.trim();
    setContent("");
    setIsSending(true);

    try {
      await onSend(messageContent);
    } catch (error) {
      // Restore content on error
      setContent(messageContent);
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }, [content, canSend, onSend]);

  const handleEmojiPress = useCallback(() => {
    // TODO: Open emoji picker
    console.log("Open emoji picker");
  }, []);

  const handleAttachmentPress = useCallback(() => {
    // TODO: Open attachment picker
    console.log("Open attachment picker");
  }, []);

  return (
    <View className="border-t border-border bg-background px-4 py-2">
      <View className="flex-row items-end rounded-2xl bg-muted">
        {/* Attachment button */}
        <Pressable
          className="mb-2 ml-2 h-8 w-8 items-center justify-center rounded-full active:bg-background"
          onPress={handleAttachmentPress}
          disabled={disabled}
        >
          <FontAwesome
            name="paperclip"
            size={18}
            color={disabled ? Colors.border : Colors.mutedForeground}
          />
        </Pressable>

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          className="max-h-32 flex-1 px-2 py-2 text-base text-foreground"
          placeholder={placeholder}
          placeholderTextColor={Colors.mutedForeground}
          value={content}
          onChangeText={handleChangeText}
          multiline
          editable={!disabled}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        {/* Emoji button */}
        <Pressable
          className="mb-2 h-8 w-8 items-center justify-center rounded-full active:bg-background"
          onPress={handleEmojiPress}
          disabled={disabled}
        >
          <FontAwesome
            name="smile-o"
            size={18}
            color={disabled ? Colors.border : Colors.mutedForeground}
          />
        </Pressable>

        {/* Send button */}
        <Pressable
          className={`mb-2 mr-2 h-8 w-8 items-center justify-center rounded-full ${
            canSend ? "bg-primary" : "bg-transparent"
          }`}
          onPress={handleSend}
          disabled={!canSend}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <FontAwesome
              name="send"
              size={14}
              color={canSend ? "white" : Colors.border}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}
