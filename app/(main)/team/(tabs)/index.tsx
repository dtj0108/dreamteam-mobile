import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Colors from "@/constants/Colors";
import { useChannels } from "@/lib/hooks/useTeam";
import { ChannelWithMembership } from "@/lib/types/team";
import { ChannelListItem } from "@/components/team/ChannelListItem";

type FilterType = "all" | "joined" | "starred";

export default function ChannelsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("joined");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch channels based on filter
  const queryParams = useMemo(() => {
    if (filter === "joined") return { joined: true };
    if (filter === "starred") return { starred: true };
    return {};
  }, [filter]);

  const {
    data: channelsData,
    isLoading,
    refetch,
  } = useChannels(queryParams);

  const channels = channelsData?.channels || [];

  // Filter channels by search query
  const filteredChannels = useMemo(() => {
    if (!searchQuery) return channels;
    const query = searchQuery.toLowerCase();
    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query) ||
        channel.description?.toLowerCase().includes(query)
    );
  }, [channels, searchQuery]);

  // Separate starred and regular channels
  const { starredChannels, regularChannels } = useMemo(() => {
    const starred = filteredChannels.filter((c) => c.membership?.is_starred);
    const regular = filteredChannels.filter((c) => !c.membership?.is_starred);
    return { starredChannels: starred, regularChannels: regular };
  }, [filteredChannels]);

  // Calculate stats
  const totalUnread = useMemo(() => {
    return channels.reduce((sum, c) => sum + (c.unread_count || 0), 0);
  }, [channels]);

  // Handlers
  const handleChannelPress = (channel: ChannelWithMembership) => {
    router.push(`/(main)/team/channels/${channel.id}`);
  };

  const handleCreateChannel = () => {
    router.push("/(main)/team/channels/new");
  };

  const FilterButton = ({
    type,
    label,
    icon,
  }: {
    type: FilterType;
    label: string;
    icon: string;
  }) => (
    <Pressable
      className={`flex-row items-center rounded-lg px-3 py-2 ${
        filter === type ? "bg-primary" : "bg-muted"
      }`}
      onPress={() => setFilter(type)}
    >
      <FontAwesome
        name={icon as any}
        size={12}
        color={filter === type ? "white" : Colors.mutedForeground}
      />
      <Text
        className={`ml-2 text-sm font-medium ${
          filter === type ? "text-white" : "text-muted-foreground"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-foreground">Channels</Text>
            <Text className="text-sm text-muted-foreground">
              {channels.length} channels
              {totalUnread > 0 && ` • ${totalUnread} unread`}
            </Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-70"
            onPress={handleCreateChannel}
          >
            <FontAwesome name="plus" size={16} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Filters */}
      <View className="flex-row gap-2 px-4 py-2">
        <FilterButton type="joined" label="Joined" icon="check-circle" />
        <FilterButton type="starred" label="Starred" icon="star" />
        <FilterButton type="all" label="All" icon="th-list" />
      </View>

      {/* Search */}
      <View className="px-4 py-2">
        <View className="flex-row items-center rounded-lg bg-muted px-3 py-2">
          <FontAwesome name="search" size={14} color="#9ca3af" />
          <TextInput
            className="ml-2 flex-1 text-foreground"
            placeholder="Search channels..."
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
      {isLoading ? (
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
          {filteredChannels.length === 0 ? (
            <View className="flex-1 items-center justify-center py-12">
              <FontAwesome name="hashtag" size={48} color="#d1d5db" />
              <Text className="mt-4 text-lg font-medium text-foreground">
                No channels found
              </Text>
              <Text className="mt-1 text-center text-muted-foreground">
                {filter === "starred"
                  ? "Star channels to see them here"
                  : filter === "joined"
                  ? "Join channels to start messaging"
                  : "No channels match your search"}
              </Text>
              {filter !== "all" && (
                <Pressable
                  className="mt-4 flex-row items-center rounded-full bg-primary px-4 py-2 active:opacity-70"
                  onPress={handleCreateChannel}
                >
                  <FontAwesome name="plus" size={12} color="white" />
                  <Text className="ml-2 font-medium text-white">
                    Create Channel
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <>
              {/* Starred Channels */}
              {starredChannels.length > 0 && (
                <View className="mb-4">
                  <Text className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                    Starred
                  </Text>
                  {starredChannels.map((channel) => (
                    <ChannelListItem
                      key={channel.id}
                      channel={channel}
                      onPress={() => handleChannelPress(channel)}
                    />
                  ))}
                </View>
              )}

              {/* Regular Channels */}
              {regularChannels.length > 0 && (
                <View>
                  {starredChannels.length > 0 && (
                    <Text className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                      Channels
                    </Text>
                  )}
                  {regularChannels.map((channel) => (
                    <ChannelListItem
                      key={channel.id}
                      channel={channel}
                      onPress={() => handleChannelPress(channel)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
