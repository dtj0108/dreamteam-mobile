import { del, get, post, put } from "../api";
import {
  Channel,
  ChannelWithMembership,
  ChannelsResponse,
  ChannelResponse,
  ChannelsQueryParams,
  CreateChannelInput,
  UpdateChannelInput,
  Message,
  MessagesResponse,
  MessagesQueryParams,
  SendMessageInput,
  ThreadResponse,
  DirectMessageConversation,
  DMConversationsResponse,
  CreateDMInput,
  UserPresence,
  UpdatePresenceInput,
  Mention,
  MentionsResponse,
  SearchResponse,
  SearchFilters,
  Agent,
  AgentsResponse,
  AgentConversation,
  WorkspaceMember,
  WorkspaceMembersResponse,
  UploadResponse,
} from "../types/team";

// ============================================================================
// Channels
// ============================================================================

export async function getChannels(
  params?: ChannelsQueryParams
): Promise<ChannelsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.append("type", params.type);
  if (params?.joined !== undefined)
    searchParams.append("joined", params.joined.toString());
  if (params?.starred !== undefined)
    searchParams.append("starred", params.starred.toString());

  const query = searchParams.toString();
  const url = query ? `/api/channels?${query}` : "/api/channels";
  console.log("[Team API] GET", url);
  try {
    const response = await get<ChannelWithMembership[] | ChannelsResponse>(url);
    console.log("[Team API] getChannels response:", Array.isArray(response) ? `array[${response.length}]` : "object", response);

    // Handle both array and object responses
    if (Array.isArray(response)) {
      return { channels: response };
    }
    return response;
  } catch (error) {
    console.error("[Team API] getChannels ERROR:", error);
    throw error;
  }
}

export async function getChannel(id: string): Promise<ChannelResponse> {
  return get<ChannelResponse>(`/api/channels/${id}`);
}

export async function createChannel(
  data: CreateChannelInput
): Promise<Channel> {
  return post<Channel>("/api/channels", data);
}

export async function updateChannel(
  id: string,
  data: UpdateChannelInput
): Promise<Channel> {
  return put<Channel>(`/api/channels/${id}`, data);
}

export async function deleteChannel(id: string): Promise<void> {
  return del(`/api/channels/${id}`);
}

export async function joinChannel(id: string): Promise<void> {
  return post(`/api/channels/${id}/join`);
}

export async function leaveChannel(id: string): Promise<void> {
  return post(`/api/channels/${id}/leave`);
}

export async function starChannel(id: string): Promise<void> {
  return post(`/api/channels/${id}/star`);
}

export async function unstarChannel(id: string): Promise<void> {
  return del(`/api/channels/${id}/star`);
}

export async function muteChannel(id: string): Promise<void> {
  return post(`/api/channels/${id}/mute`);
}

export async function unmuteChannel(id: string): Promise<void> {
  return del(`/api/channels/${id}/mute`);
}

export async function getChannelMembers(
  id: string
): Promise<WorkspaceMembersResponse> {
  const url = `/api/channels/${id}/members`;
  console.log("[Team API] GET", url);
  try {
    const response = await get<WorkspaceMember[] | WorkspaceMembersResponse>(url);
    console.log("[Team API] getChannelMembers response:", Array.isArray(response) ? `array[${response.length}]` : "object", response);

    // Handle both array and object responses
    if (Array.isArray(response)) {
      return { members: response };
    }
    return response;
  } catch (error) {
    console.error("[Team API] getChannelMembers ERROR:", error);
    throw error;
  }
}

export async function addChannelMember(
  channelId: string,
  userId: string
): Promise<void> {
  return post(`/api/channels/${channelId}/members`, { userId });
}

export async function removeChannelMember(
  channelId: string,
  userId: string
): Promise<void> {
  return del(`/api/channels/${channelId}/members/${userId}`);
}

// ============================================================================
// Messages
// ============================================================================

export async function getChannelMessages(
  channelId: string,
  params?: MessagesQueryParams
): Promise<MessagesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.before) searchParams.append("before", params.before);
  if (params?.after) searchParams.append("after", params.after);

  const query = searchParams.toString();
  const url = query
    ? `/api/channels/${channelId}/messages?${query}`
    : `/api/channels/${channelId}/messages`;
  console.log("[Team API] GET", url);
  try {
    const response = await get<Message[] | MessagesResponse>(url);
    console.log("[Team API] getChannelMessages response:", Array.isArray(response) ? `array[${response.length}]` : "object", response);

    // Handle both array and object responses
    if (Array.isArray(response)) {
      return { messages: response, has_more: false };
    }
    return response;
  } catch (error) {
    console.error("[Team API] getChannelMessages ERROR:", error);
    throw error;
  }
}

export async function sendChannelMessage(
  channelId: string,
  data: SendMessageInput
): Promise<Message> {
  return post<Message>(`/api/channels/${channelId}/messages`, data);
}

export async function getMessage(id: string): Promise<Message> {
  return get<Message>(`/api/messages/${id}`);
}

export async function updateMessage(
  id: string,
  content: string
): Promise<Message> {
  return put<Message>(`/api/messages/${id}`, { content });
}

export async function deleteMessage(id: string): Promise<void> {
  return del(`/api/messages/${id}`);
}

export async function pinMessage(id: string): Promise<void> {
  return post(`/api/messages/${id}/pin`);
}

export async function unpinMessage(id: string): Promise<void> {
  return del(`/api/messages/${id}/pin`);
}

// ============================================================================
// Threads
// ============================================================================

export async function getThread(
  messageId: string,
  params?: MessagesQueryParams
): Promise<ThreadResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const query = searchParams.toString();
  const url = query
    ? `/api/messages/${messageId}/thread?${query}`
    : `/api/messages/${messageId}/thread`;
  return get<ThreadResponse>(url);
}

export async function replyToThread(
  messageId: string,
  content: string
): Promise<Message> {
  return post<Message>(`/api/messages/${messageId}/thread`, { content });
}

// ============================================================================
// Reactions
// ============================================================================

export async function addReaction(
  messageId: string,
  emoji: string
): Promise<void> {
  return post(`/api/messages/${messageId}/reactions`, { emoji });
}

export async function removeReaction(
  messageId: string,
  emoji: string
): Promise<void> {
  return del(`/api/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
}

export async function getReactions(messageId: string): Promise<{
  reactions: Array<{
    emoji: string;
    count: number;
    users: Array<{ id: string; name: string }>;
  }>;
}> {
  return get(`/api/messages/${messageId}/reactions`);
}

// ============================================================================
// Direct Messages
// ============================================================================

export async function getDMConversations(): Promise<DMConversationsResponse> {
  console.log("[Team API] GET /api/dm");
  try {
    const response = await get<DirectMessageConversation[] | DMConversationsResponse>("/api/dm");
    console.log("[Team API] getDMConversations response:", Array.isArray(response) ? `array[${response.length}]` : "object", response);

    // Handle both array and object responses
    if (Array.isArray(response)) {
      return { conversations: response };
    }
    return response;
  } catch (error) {
    console.error("[Team API] getDMConversations ERROR:", error);
    throw error;
  }
}

export async function getDMConversation(
  id: string
): Promise<DirectMessageConversation> {
  return get<DirectMessageConversation>(`/api/dm/${id}`);
}

export async function startDMConversation(
  data: CreateDMInput
): Promise<DirectMessageConversation & { isNew: boolean }> {
  return post<DirectMessageConversation & { isNew: boolean }>("/api/dm", data);
}

export async function getDMMessages(
  dmId: string,
  params?: MessagesQueryParams
): Promise<MessagesResponse> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.before) searchParams.append("before", params.before);
  if (params?.after) searchParams.append("after", params.after);

  const query = searchParams.toString();
  const url = query ? `/api/dm/${dmId}/messages?${query}` : `/api/dm/${dmId}/messages`;
  console.log("[Team API] GET", url);
  try {
    const response = await get<Message[] | MessagesResponse>(url);
    console.log("[Team API] getDMMessages response:", Array.isArray(response) ? `array[${response.length}]` : "object", response);

    // Handle both array and object responses
    if (Array.isArray(response)) {
      return { messages: response, has_more: false };
    }
    return response;
  } catch (error) {
    console.error("[Team API] getDMMessages ERROR:", error);
    throw error;
  }
}

export async function sendDMMessage(
  dmId: string,
  data: SendMessageInput
): Promise<Message> {
  return post<Message>(`/api/dm/${dmId}/messages`, data);
}

export async function muteDM(dmId: string): Promise<void> {
  return post(`/api/dm/${dmId}/mute`);
}

export async function unmuteDM(dmId: string): Promise<void> {
  return del(`/api/dm/${dmId}/mute`);
}

// ============================================================================
// Presence & Status
// ============================================================================

export async function updatePresence(data: UpdatePresenceInput): Promise<void> {
  return post("/api/presence", data);
}

export async function getUserPresence(userId: string): Promise<UserPresence> {
  return get<UserPresence>(`/api/users/${userId}/presence`);
}

// ============================================================================
// Typing Indicators
// ============================================================================

export async function sendTypingIndicator(channelId: string): Promise<void> {
  return post(`/api/channels/${channelId}/typing`);
}

export async function sendDMTypingIndicator(dmId: string): Promise<void> {
  return post(`/api/dm/${dmId}/typing`);
}

// ============================================================================
// Mentions
// ============================================================================

export async function getMentions(
  unreadOnly?: boolean
): Promise<MentionsResponse> {
  const url = unreadOnly ? "/api/mentions?unread=true" : "/api/mentions";
  console.log("[Team API] GET", url);
  try {
    const response = await get<Mention[] | MentionsResponse>(url);
    console.log("[Team API] getMentions response:", Array.isArray(response) ? `array[${response.length}]` : "object", response);

    // Handle both array and object responses
    if (Array.isArray(response)) {
      return { mentions: response };
    }
    return response;
  } catch (error) {
    console.error("[Team API] getMentions ERROR:", error);
    throw error;
  }
}

export async function markMentionRead(id: string): Promise<void> {
  return post(`/api/mentions/${id}/read`);
}

export async function markAllMentionsRead(): Promise<void> {
  return post("/api/mentions/read-all");
}

// ============================================================================
// Search
// ============================================================================

export async function searchMessages(
  query: string,
  filters?: SearchFilters
): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  searchParams.append("q", query);
  if (filters?.channel_id) searchParams.append("channel", filters.channel_id);
  if (filters?.from_user_id) searchParams.append("from", filters.from_user_id);
  if (filters?.after) searchParams.append("after", filters.after);
  if (filters?.before) searchParams.append("before", filters.before);
  if (filters?.has_attachments)
    searchParams.append("has", "attachments");

  return get<SearchResponse>(`/api/search/messages?${searchParams.toString()}`);
}

// ============================================================================
// AI Agents
// ============================================================================

export async function getAgents(): Promise<AgentsResponse> {
  console.log("[Team API] GET /api/agents");
  try {
    const response = await get<Agent[] | AgentsResponse>("/api/agents");
    console.log("[Team API] getAgents response:", Array.isArray(response) ? `array[${response.length}]` : "object", response);

    // Handle both array and object responses
    if (Array.isArray(response)) {
      return { agents: response };
    }
    return response;
  } catch (error) {
    console.error("[Team API] getAgents ERROR:", error);
    throw error;
  }
}

export async function getAgent(id: string): Promise<Agent> {
  return get<Agent>(`/api/agents/${id}`);
}

export async function getAgentConversation(
  agentId: string,
  conversationId: string
): Promise<AgentConversation> {
  return get<AgentConversation>(
    `/api/agents/${agentId}/conversations/${conversationId}`
  );
}

// For SSE streaming, we need a special function that returns the response directly
export async function chatWithAgentStream(
  agentId: string,
  message: string,
  conversationId?: string
): Promise<Response> {
  const { supabase } = await import("../supabase");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const API_URL = process.env.EXPO_PUBLIC_API_URL!;

  return fetch(`${API_URL}/api/agents/${agentId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: session ? `Bearer ${session.access_token}` : "",
    },
    body: JSON.stringify({ message, conversationId }),
  });
}

// ============================================================================
// Workspace Members
// ============================================================================

export async function getWorkspaceMembers(): Promise<WorkspaceMembersResponse> {
  console.log("[Team API] GET /api/workspace/members");
  try {
    const response = await get<WorkspaceMember[] | WorkspaceMembersResponse>(
      "/api/workspace/members"
    );
    console.log("[Team API] getWorkspaceMembers response:", Array.isArray(response) ? `array[${response.length}]` : "object", response);

    // Handle both array and object responses
    if (Array.isArray(response)) {
      return { members: response };
    }
    return response;
  } catch (error) {
    console.error("[Team API] getWorkspaceMembers ERROR:", error);
    throw error;
  }
}

// ============================================================================
// File Uploads
// ============================================================================

export async function uploadAttachment(
  file: FormData
): Promise<UploadResponse> {
  const { supabase } = await import("../supabase");
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const API_URL = process.env.EXPO_PUBLIC_API_URL!;

  const response = await fetch(`${API_URL}/api/uploads`, {
    method: "POST",
    headers: {
      Authorization: session ? `Bearer ${session.access_token}` : "",
      // Don't set Content-Type - let browser set it with boundary for multipart
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Upload failed");
  }

  return response.json();
}
