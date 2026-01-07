import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";
import { Ionicons } from "@expo/vector-icons";

interface MessageInputProps {
  channelId?: string;
  dmId?: string;
  threadId?: string;
  channelName?: string; // For dynamic placeholder
  placeholder?: string;
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
  onAttachmentPress?: () => void;
  onMicrophonePress?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function MessageInput({
  channelId,
  dmId,
  threadId,
  channelName,
  placeholder,
  onSend,
  onTyping,
  onAttachmentPress,
  onMicrophonePress,
  disabled = false,
  autoFocus = false,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  // Auto-focus with delay for screen transition
  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const hasContent = content.trim().length > 0;
  const canSend = hasContent && !disabled && !isSending;

  // Dynamic placeholder based on context
  const displayPlaceholder = placeholder || (channelName ? `Message #${channelName}` : "Message...");

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

  const handleAttachmentPress = useCallback(() => {
    onAttachmentPress?.();
  }, [onAttachmentPress]);

  const handleMicrophonePress = useCallback(() => {
    onMicrophonePress?.();
  }, [onMicrophonePress]);

  const textInput = (
    <TextInput
      ref={inputRef}
      className="max-h-40 text-base text-foreground"
      placeholder={displayPlaceholder}
      placeholderTextColor="#9ca3af"
      value={content}
      onChangeText={handleChangeText}
      multiline
      editable={!disabled}
      returnKeyType="default"
      blurOnSubmit={false}
      textAlignVertical="center"
    />
  );

  const actionButtons = (
    <View className="flex-row items-center justify-between pt-1">
        {/* Left side action buttons */}
        <View className="flex-row items-center">
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
            onPress={handleAttachmentPress}
            disabled={disabled}
          >
            <Ionicons
              name="add"
              size={22}
              color={disabled ? "#d1d5db" : "#64748b"}
            />
          </Pressable>
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
            disabled={disabled}
          >
            <Ionicons
              name="text"
              size={18}
              color={disabled ? "#d1d5db" : "#64748b"}
            />
          </Pressable>
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
            disabled={disabled}
          >
            <Ionicons
              name="happy-outline"
              size={20}
              color={disabled ? "#d1d5db" : "#64748b"}
            />
          </Pressable>
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
            disabled={disabled}
          >
            <Ionicons
              name="at"
              size={20}
              color={disabled ? "#d1d5db" : "#64748b"}
            />
          </Pressable>
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
            disabled={disabled}
          >
            <Ionicons
              name="create-outline"
              size={20}
              color={disabled ? "#d1d5db" : "#64748b"}
            />
          </Pressable>
        </View>

        {/* Send button - always visible */}
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
          onPress={handleSend}
          disabled={!canSend}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#0ea5e9" />
          ) : (
            <Ionicons
              name={canSend ? "send" : "send-outline"}
              size={canSend ? 22 : 20}
              color={canSend ? "#0ea5e9" : "#d1d5db"}
            />
          )}
        </Pressable>
    </View>
  );

  const inputContent = (
    <>
      {/* Text input */}
      <View className="min-h-[44px] justify-center px-2">
        {textInput}
      </View>
      {/* Action buttons */}
      {actionButtons}
    </>
  );

  return (
    <View
      className="px-4"
      style={{ paddingTop: 8, paddingBottom: 8 + insets.bottom }}
    >
      {Platform.OS === "ios" ? (
        <GlassView
          style={{
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 8,
            overflow: "hidden",
          }}
        >
          {inputContent}
        </GlassView>
      ) : (
        <View className="rounded-2xl bg-gray-100 px-3 py-2">
          {inputContent}
        </View>
      )}
    </View>
  );
}
