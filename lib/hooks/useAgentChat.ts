import { useState, useCallback, useRef } from "react";

import { chatWithAgentStream } from "../api/team";
import { AgentMessage, AgentToolCall, AgentToolResult } from "../types/team";

interface UseAgentChatOptions {
  agentId: string;
  onError?: (error: Error) => void;
}

interface UseAgentChatResult {
  messages: AgentMessage[];
  isStreaming: boolean;
  conversationId: string | null;
  sendMessage: (content: string) => Promise<void>;
  startNewConversation: () => void;
  error: Error | null;
}

export function useAgentChat({
  agentId,
  onError,
}: UseAgentChatOptions): UseAgentChatResult {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      // Add user message
      const userMessage: AgentMessage = {
        role: "user",
        content: content.trim(),
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Start streaming
      setIsStreaming(true);
      setError(null);

      // Create a placeholder for the assistant message
      const assistantMessage: AgentMessage = {
        role: "assistant",
        content: "",
        tool_calls: [],
        tool_results: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        // Make SSE request
        const response = await chatWithAgentStream(
          agentId,
          content.trim(),
          conversationId || undefined
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Read the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedContent = "";
        let currentToolCalls: AgentToolCall[] = [];
        let currentToolResults: AgentToolResult[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE events
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              // Handle event type if needed
              continue;
            }

            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);

                switch (parsed.type) {
                  case "text":
                    accumulatedContent += parsed.content;
                    // Update the assistant message content
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastIndex = newMessages.length - 1;
                      if (newMessages[lastIndex]?.role === "assistant") {
                        newMessages[lastIndex] = {
                          ...newMessages[lastIndex],
                          content: accumulatedContent,
                        };
                      }
                      return newMessages;
                    });
                    break;

                  case "tool_call":
                    currentToolCalls.push({
                      id: parsed.id || `tool_${Date.now()}`,
                      name: parsed.name,
                      args: parsed.args,
                    });
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastIndex = newMessages.length - 1;
                      if (newMessages[lastIndex]?.role === "assistant") {
                        newMessages[lastIndex] = {
                          ...newMessages[lastIndex],
                          tool_calls: [...currentToolCalls],
                        };
                      }
                      return newMessages;
                    });
                    break;

                  case "tool_result":
                    currentToolResults.push({
                      tool_call_id: parsed.tool_call_id || parsed.id,
                      name: parsed.name,
                      result: parsed.result,
                    });
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      const lastIndex = newMessages.length - 1;
                      if (newMessages[lastIndex]?.role === "assistant") {
                        newMessages[lastIndex] = {
                          ...newMessages[lastIndex],
                          tool_results: [...currentToolResults],
                        };
                      }
                      return newMessages;
                    });
                    break;

                  case "conversation_id":
                    setConversationId(parsed.id);
                    break;

                  case "done":
                    // Streaming complete
                    break;

                  case "error":
                    throw new Error(parsed.message || "Agent error");
                }
              } catch (parseError) {
                // Ignore parse errors for incomplete JSON
                if (parseError instanceof SyntaxError) continue;
                throw parseError;
              }
            }
          }
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to send message");
        setError(error);
        onError?.(error);

        // Remove the empty assistant message on error
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (
            newMessages[lastIndex]?.role === "assistant" &&
            !newMessages[lastIndex]?.content
          ) {
            newMessages.pop();
          }
          return newMessages;
        });
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [agentId, conversationId, isStreaming, onError]
  );

  const startNewConversation = useCallback(() => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setConversationId(null);
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    startNewConversation,
    error,
  };
}
