import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ScrollView, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View className="py-4">
          <Text className="text-2xl font-bold text-foreground">Dashboard</Text>
          <Text className="text-muted-foreground">
            Your financial overview
          </Text>
        </View>

        {/* Net Worth Card */}
        <View className="mb-4 rounded-xl bg-gray-900 p-4">
          <Text className="text-sm text-gray-400">Net Worth</Text>
          <Text className="text-3xl font-bold text-white">$0.00</Text>
          <View className="mt-2 flex-row">
            <Text className="text-sm text-gray-400">
              Assets: <Text className="text-green-400">$0.00</Text>
            </Text>
            <Text className="ml-4 text-sm text-gray-400">
              Liabilities: <Text className="text-red-400">$0.00</Text>
            </Text>
          </View>
        </View>

        {/* Metric Cards */}
        <View className="mb-4 flex-row gap-3">
          <MetricCard
            title="Income"
            value="$0.00"
            change={0}
            icon="arrow-down"
            iconColor={Colors.success}
          />
          <MetricCard
            title="Expenses"
            value="$0.00"
            change={0}
            icon="arrow-up"
            iconColor={Colors.destructive}
          />
        </View>

        <View className="mb-4 flex-row gap-3">
          <MetricCard
            title="Profit"
            value="$0.00"
            change={0}
            icon="line-chart"
            iconColor={Colors.primary}
          />
          <MetricCard
            title="Savings"
            value="$0.00"
            change={0}
            icon="dollar"
            iconColor={Colors.warning}
          />
        </View>

        {/* Recent Transactions */}
        <View className="mb-4">
          <Text className="mb-3 text-lg font-semibold text-foreground">
            Recent Transactions
          </Text>
          <View className="rounded-xl bg-muted p-4">
            <Text className="text-center text-muted-foreground">
              No transactions yet
            </Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Add your first transaction to get started
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-8">
          <Text className="mb-3 text-lg font-semibold text-foreground">
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <QuickActionButton icon="plus" label="Add Transaction" />
            <QuickActionButton icon="university" label="Add Account" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
  iconColor,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
}) {
  return (
    <View className="flex-1 rounded-xl bg-muted p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">{title}</Text>
        <FontAwesome name={icon} size={16} color={iconColor} />
      </View>
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      {change !== 0 && (
        <Text
          className={`text-sm ${change > 0 ? "text-green-500" : "text-red-500"}`}
        >
          {change > 0 ? "+" : ""}
          {change}% vs last month
        </Text>
      )}
    </View>
  );
}

function QuickActionButton({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  label: string;
}) {
  return (
    <View className="flex-1 items-center rounded-xl bg-primary/10 p-4">
      <FontAwesome name={icon} size={24} color={Colors.primary} />
      <Text className="mt-2 text-sm font-medium text-primary">{label}</Text>
    </View>
  );
}
