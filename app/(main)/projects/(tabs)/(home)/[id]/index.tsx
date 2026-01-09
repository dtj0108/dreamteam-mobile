import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";

import { useProject, useTasks, useUpdateTask, useDeleteTask } from "../../../../../../lib/hooks/useProjects";
import {
  Task,
  TaskStatus,
  TASK_STATUS_COLORS,
  TASK_STATUS_ORDER,
  getTaskStatusLabel,
} from "../../../../../../lib/types/projects";
import { TaskCard } from "../../../../../../components/projects/TaskCard";
import { ProgressBar } from "../../../../../../components/projects/ProgressBar";
import { StatusBadge } from "../../../../../../components/projects/StatusBadge";
import { ProjectFABMenu } from "../../../../../../components/projects/FABMenu";

export default function ProjectKanbanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("todo");

  // Fetch project and tasks
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: tasksData, isLoading: tasksLoading, refetch } = useTasks(id);
  const tasks = tasksData?.tasks || [];

  // Mutations
  const updateTask = useUpdateTask(id);
  const deleteTask = useDeleteTask(id);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  // Get tasks for selected status
  const displayedTasks = tasksByStatus[selectedStatus] || [];

  // Calculate counts for segment control
  const statusCounts = useMemo(() => {
    return TASK_STATUS_ORDER.map((status) => ({
      status,
      count: tasksByStatus[status]?.length || 0,
    }));
  }, [tasksByStatus]);

  // Handlers
  const handleTaskPress = (task: Task) => {
    // Navigate to task detail screen
    router.push({
      pathname: "/(main)/projects/(tabs)/(home)/tasks/[taskId]",
      params: { taskId: task.id, projectId: id },
    });
  };

  const handleTaskLongPress = (task: Task) => {
    showTaskActions(task);
  };

  const showTaskActions = (task: Task) => {
    const options = [
      "Move to To Do",
      "Move to In Progress",
      "Move to Review",
      "Move to Done",
      "Delete",
      "Cancel",
    ];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: 4,
          cancelButtonIndex: 5,
          title: task.title,
          message: `Current status: ${getTaskStatusLabel(task.status)}`,
        },
        (buttonIndex) => {
          handleActionSelection(task, buttonIndex);
        }
      );
    } else {
      // Android fallback
      Alert.alert(
        task.title,
        `Current status: ${getTaskStatusLabel(task.status)}`,
        [
          { text: "Move to To Do", onPress: () => moveTask(task, "todo") },
          { text: "Move to In Progress", onPress: () => moveTask(task, "in_progress") },
          { text: "Move to Review", onPress: () => moveTask(task, "review") },
          { text: "Move to Done", onPress: () => moveTask(task, "done") },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => confirmDelete(task),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const handleActionSelection = (task: Task, buttonIndex: number) => {
    switch (buttonIndex) {
      case 0:
        moveTask(task, "todo");
        break;
      case 1:
        moveTask(task, "in_progress");
        break;
      case 2:
        moveTask(task, "review");
        break;
      case 3:
        moveTask(task, "done");
        break;
      case 4:
        confirmDelete(task);
        break;
    }
  };

  const moveTask = (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    updateTask.mutate({
      taskId: task.id,
      data: { status: newStatus },
    });
  };

  const confirmDelete = (task: Task) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask.mutate(task.id),
        },
      ]
    );
  };

  const handleAddTask = () => {
    router.push({
      pathname: "/(main)/projects/(tabs)/(home)/tasks/new",
      params: { projectId: id, defaultStatus: selectedStatus },
    });
  };

  const isLoading = projectLoading || tasksLoading;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <FontAwesome name="folder-open-o" size={48} color="#d1d5db" />
        <Text className="mt-4 text-lg font-medium text-foreground">
          Project not found
        </Text>
        <Pressable
          className="mt-4 rounded-full bg-primary px-4 py-2 active:opacity-70"
          onPress={() => router.back()}
        >
          <Text className="font-medium text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerBackTitle: "Projects",
          headerStyle: { backgroundColor: "#ffffff" },
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable
              className="mr-2 p-2"
              onPress={() => router.push({
                pathname: "/(main)/projects/(tabs)/(home)/[id]/settings",
                params: { id },
              })}
            >
              <FontAwesome name="cog" size={20} color="#6b7280" />
            </Pressable>
          ),
        }}
      />

      {/* Project Header */}
      <View className="border-b border-gray-100 px-4 pb-4">
        <View className="flex-row items-center">
          <View
            className="mr-3 h-12 w-12 items-center justify-center rounded-xl"
            style={{ backgroundColor: project.color + "20" }}
          >
            <FontAwesome name="folder" size={22} color={project.color} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
              {project.name}
            </Text>
            <View className="mt-0.5 flex-row items-center">
              <StatusBadge projectStatus={project.status} size="sm" />
              {project.target_end_date && (
                <Text className="ml-2 text-xs text-muted-foreground">
                  Due {new Date(project.target_end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Progress */}
        {project.progress !== undefined && (
          <View className="mt-3">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-xs text-muted-foreground">Progress</Text>
              <Text className="text-xs font-medium text-foreground">
                {project.completedTasks || 0}/{project.totalTasks || 0} tasks
              </Text>
            </View>
            <ProgressBar progress={project.progress} size="sm" color={project.color} />
          </View>
        )}

        {/* View Tabs */}
        <View className="mt-3 flex-row gap-2">
          <View className="flex-row rounded-lg bg-muted p-1">
            <View className="rounded-md bg-white px-3 py-1.5 shadow-sm">
              <Text className="text-xs font-medium text-foreground">Board</Text>
            </View>
            <Pressable
              className="px-3 py-1.5"
              onPress={() => router.push({
                pathname: "/(main)/projects/(tabs)/(home)/[id]/list",
                params: { id },
              })}
            >
              <Text className="text-xs font-medium text-muted-foreground">List</Text>
            </Pressable>
            <Pressable
              className="px-3 py-1.5"
              onPress={() => router.push({
                pathname: "/(main)/projects/(tabs)/(home)/[id]/calendar",
                params: { id },
              })}
            >
              <Text className="text-xs font-medium text-muted-foreground">Calendar</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-3 flex-row gap-2">
          <Pressable
            className="flex-row items-center rounded-lg bg-muted px-3 py-2 active:opacity-70"
            onPress={() => router.push({
              pathname: "/(main)/projects/(tabs)/(home)/[id]/milestones",
              params: { id },
            })}
          >
            <FontAwesome name="flag" size={12} color="#6b7280" />
            <Text className="ml-1.5 text-xs font-medium text-muted-foreground">Milestones</Text>
          </Pressable>
          <Pressable
            className="flex-row items-center rounded-lg bg-muted px-3 py-2 active:opacity-70"
            onPress={() => router.push({
              pathname: "/(main)/projects/(tabs)/(home)/[id]/activity",
              params: { id },
            })}
          >
            <FontAwesome name="clock-o" size={12} color="#6b7280" />
            <Text className="ml-1.5 text-xs font-medium text-muted-foreground">Activity</Text>
          </Pressable>
          <Pressable
            className="flex-row items-center rounded-lg bg-muted px-3 py-2 active:opacity-70"
            onPress={() => router.push({
              pathname: "/(main)/projects/(tabs)/(home)/[id]/knowledge",
              params: { id },
            })}
          >
            <FontAwesome name="file-text-o" size={12} color="#6b7280" />
            <Text className="ml-1.5 text-xs font-medium text-muted-foreground">Knowledge</Text>
          </Pressable>
        </View>
      </View>

      {/* Segment Control for Status */}
      <View className="flex-row border-b border-gray-100 px-2 py-2">
        {statusCounts.map(({ status, count }) => {
          const isSelected = selectedStatus === status;
          const color = TASK_STATUS_COLORS[status];

          return (
            <Pressable
              key={status}
              className={`mx-1 flex-1 items-center rounded-lg py-2 ${isSelected ? "" : "bg-transparent"}`}
              style={isSelected ? { backgroundColor: color + "15" } : undefined}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                className={`text-xs font-medium ${isSelected ? "" : "text-muted-foreground"}`}
                style={isSelected ? { color } : undefined}
              >
                {getTaskStatusLabel(status)}
              </Text>
              <Text
                className={`mt-0.5 text-lg font-bold ${isSelected ? "" : "text-foreground"}`}
                style={isSelected ? { color } : undefined}
              >
                {count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Task List */}
      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4 pt-2"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item)}
            onLongPress={() => handleTaskLongPress(item)}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-12">
            <FontAwesome name="check-square-o" size={48} color="#d1d5db" />
            <Text className="mt-4 text-lg font-medium text-foreground">
              No {getTaskStatusLabel(selectedStatus).toLowerCase()} tasks
            </Text>
            <Text className="mt-1 text-center text-muted-foreground">
              Tasks with this status will appear here
            </Text>
          </View>
        }
      />

      {/* FAB Menu */}
      <ProjectFABMenu onCreateTask={handleAddTask} />
    </View>
  );
}
