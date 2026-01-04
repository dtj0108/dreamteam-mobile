import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Colors from "@/constants/Colors";
import {
  useDMConversations,
  useWorkspaceMembers,
  useStartDMConversation,
} from "@/lib/hooks/useTeam";
import { DirectMessageConversation, WorkspaceMember } from "@/lib/types/team";
import { DMListItem } from "@/components/team/DMListItem";
import { UserListItem } from "@/components/team/UserListItem";

export default function DMListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewDMModal, setShowNewDMModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // Fetch DM conversations
  const {
    data: dmsData,
    isLoading: dmsLoading,
    refetch,
  } = useDMConversations();

  // Fetch workspace members for new DM modal
  const { data: membersData, isLoading: membersLoading } = useWorkspaceMembers();

  // Start DM mutation
  const startDMMutation = useStartDMConversation();

  const conversations = dmsData?.conversations || [];
  const members = membersData?.members || [];

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((dm) =>
      dm.participant?.user.name.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Filter members for new DM modal
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery) return members;
    const query = memberSearchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.user.name.toLowerCase().includes(query) ||
        m.user.email.toLowerCase().includes(query)
    );
  }, [members, memberSearchQuery]);

  // Calculate total unread
  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, dm) => sum + (dm.unread_count || 0), 0);
  }, [conversations]);

  // Handlers
  const handleDMPress = (dm: DirectMessageConversation) => {
    router.push(`/(main)/team/dm/${dm.id}`);
  };

  const handleNewDM = () => {
    setShowNewDMModal(true);
  };

  const handleSelectMember = async (member: WorkspaceMember) => {
    try {
      const result = await startDMMutation.mutateAsync({
        user_id: member.user_id,
      });
      setShowNewDMModal(false);
      setMemberSearchQuery("");
      router.push(`/(main)/team/dm/${result.id}`);
    } catch (error) {
      console.error("Failed to start DM:", error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              Direct Messages
            </Text>
            <Text className="text-sm text-muted-foreground">
              {conversations.length} conversations
              {totalUnread > 0 && ` • ${totalUnread} unread`}
            </Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-70"
            onPress={handleNewDM}
          >
            <FontAwesome name="plus" size={16} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Search */}
      <View className="px-4 py-2">
        <View className="flex-row items-center rounded-lg bg-muted px-3 py-2">
          <FontAwesome name="search" size={14} color="#9ca3af" />
          <TextInput
            className="ml-2 flex-1 text-foreground"
            placeholder="Search conversations..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <FontAwesome name="times-circle" size={14} color="#9ca3af" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {dmsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} />
          }
        >
          {filteredConversations.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <FontAwesome name="comments-o" size={48} color="#d1d5db" />
              <Text className="mt-4 text-lg font-medium text-foreground">
                {searchQuery ? "No conversations found" : "No direct messages"}
              </Text>
              <Text className="mt-1 text-center text-muted-foreground">
                {searchQuery
                  ? "Try a different search"
                  : "Start a conversation with a team member"}
              </Text>
              {!searchQuery && (
                <Pressable
                  className="mt-4 flex-row items-center rounded-full bg-primary px-4 py-2 active:opacity-70"
                  onPress={handleNewDM}
                >
                  <FontAwesome name="plus" size={12} color="white" />
                  <Text className="ml-2 font-medium text-white">
                    Start Conversation
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            filteredConversations.map((dm) => (
              <DMListItem
                key={dm.id}
                conversation={dm}
                onPress={() => handleDMPress(dm)}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* New DM Modal */}
      <Modal
        visible={showNewDMModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewDMModal(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          {/* Modal Header */}
          <View className="flex-row items-center border-b border-border px-4 py-3">
            <Pressable
              className="mr-3 h-8 w-8 items-center justify-center rounded-full active:bg-muted"
              onPress={() => {
                setShowNewDMModal(false);
                setMemberSearchQuery("");
              }}
            >
              <FontAwesome name="times" size={18} color={Colors.foreground} />
            </Pressable>
            <Text className="flex-1 text-lg font-semibold text-foreground">
              New Message
            </Text>
          </View>

          {/* Member Search */}
          <View className="px-4 py-3">
            <View className="flex-row items-center rounded-lg bg-muted px-3 py-2">
              <FontAwesome name="search" size={14} color="#9ca3af" />
              <TextInput
                className="ml-2 flex-1 text-foreground"
                placeholder="Search team members..."
                placeholderTextColor="#9ca3af"
                value={memberSearchQuery}
                onChangeText={setMemberSearchQuery}
                autoFocus
              />
              {memberSearchQuery.length > 0 && (
                <Pressable onPress={() => setMemberSearchQuery("")}>
                  <FontAwesome name="times-circle" size={14} color="#9ca3af" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Member List */}
          {membersLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredMembers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => (
                <UserListItem
                  member={item}
                  onPress={() => handleSelectMember(item)}
                />
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                  <Text className="text-muted-foreground">
                    No members found
                  </Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}
