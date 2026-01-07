import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useAccounts } from "@/lib/hooks/useAccounts";
import { useAnalyticsOverview } from "@/lib/hooks/useAnalytics";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { getTransactionColor, Transaction } from "@/lib/types/finance";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function DashboardScreen() {
  const router = useRouter();

  // Fetch accounts for net worth
  const {
    data: accountsData,
    isLoading: accountsLoading,
    refetch: refetchAccounts,
    isRefetching: accountsRefetching,
  } = useAccounts();

  // Fetch analytics overview for monthly metrics
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
    isRefetching: analyticsRefetching,
  } = useAnalyticsOverview();

  // Fetch recent transactions (limit 5)
  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
    isRefetching: transactionsRefetching,
  } = useTransactions({ limit: 5 });

  // Derived state with defaults
  const totals = accountsData?.totals ?? {
    netWorth: 0,
    assets: 0,
    liabilities: 0,
  };
  const analytics = analyticsData ?? {
    currentMonth: { income: 0, expenses: 0, profit: 0 },
    lastMonth: { income: 0, expenses: 0, profit: 0 },
    changes: { income: 0, expenses: 0, profit: 0 },
    totalBalance: 0,
  };
  const recentTransactions = transactionsData?.transactions ?? [];

  const isLoading = accountsLoading || analyticsLoading || transactionsLoading;
  const isRefetching =
    accountsRefetching || analyticsRefetching || transactionsRefetching;

  const handleRefresh = () => {
    refetchAccounts();
    refetchAnalytics();
    refetchTransactions();
  };

  // Calculate savings rate
  const savingsRate =
    analytics.currentMonth.income > 0
      ? Math.round(
          (analytics.currentMonth.profit / analytics.currentMonth.income) * 100
        )
      : 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="py-4">
          <Text className="text-2xl font-bold text-foreground">Dashboard</Text>
          <Text className="text-muted-foreground">
            Your financial overview
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text className="mt-2 text-muted-foreground">
              Loading dashboard...
            </Text>
          </View>
        ) : (
          <>
            {/* Net Worth Card */}
            <View className="mb-4 rounded-xl bg-gray-900 p-4">
              <Text className="text-sm text-gray-400">Net Worth</Text>
              <Text className="text-3xl font-bold text-white">
                {formatCurrency(totals.netWorth)}
              </Text>
              <View className="mt-2 flex-row">
                <Text className="text-sm text-gray-400">
                  Assets:{" "}
                  <Text className="text-green-400">
                    {formatCurrency(totals.assets)}
                  </Text>
                </Text>
                <Text className="ml-4 text-sm text-gray-400">
                  Liabilities:{" "}
                  <Text className="text-red-400">
                    {formatCurrency(totals.liabilities)}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Metric Cards */}
            <View className="mb-4 flex-row gap-3">
              <MetricCard
                title="Income"
                value={formatCurrency(analytics.currentMonth.income)}
                change={analytics.changes.income}
                icon="arrow-down"
                iconColor={Colors.success}
              />
              <MetricCard
                title="Expenses"
                value={formatCurrency(analytics.currentMonth.expenses)}
                change={analytics.changes.expenses}
                icon="arrow-up"
                iconColor={Colors.destructive}
                invertChangeColor
              />
            </View>

            <View className="mb-4 flex-row gap-3">
              <MetricCard
                title="Profit"
                value={formatCurrency(analytics.currentMonth.profit)}
                change={analytics.changes.profit}
                icon="line-chart"
                iconColor={Colors.primary}
              />
              <MetricCard
                title="Savings Rate"
                value={`${savingsRate}%`}
                change={0}
                icon="dollar"
                iconColor={Colors.warning}
              />
            </View>

            {/* Recent Transactions */}
            <View className="mb-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">
                  Recent Transactions
                </Text>
                <Pressable
                  onPress={() => router.push("/(main)/finance/transactions")}
                >
                  <Text className="text-sm text-primary">View All</Text>
                </Pressable>
              </View>

              {recentTransactions.length > 0 ? (
                <View className="rounded-xl bg-muted">
                  {recentTransactions.map((txn, index) => (
                    <RecentTransactionRow
                      key={txn.id}
                      transaction={txn}
                      isLast={index === recentTransactions.length - 1}
                      onPress={() =>
                        router.push(`/(main)/finance/transactions/${txn.id}`)
                      }
                    />
                  ))}
                </View>
              ) : (
                <View className="rounded-xl bg-muted p-4">
                  <Text className="text-center text-muted-foreground">
                    No transactions yet
                  </Text>
                  <Text className="mt-1 text-center text-sm text-muted-foreground">
                    Add your first transaction to get started
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View className="mb-8">
              <Text className="mb-3 text-lg font-semibold text-foreground">
                Quick Actions
              </Text>
              <View className="flex-row gap-3">
                <QuickActionButton
                  icon="plus"
                  label="Add Transaction"
                  onPress={() =>
                    router.push("/(main)/finance/transactions/new")
                  }
                />
                <QuickActionButton
                  icon="university"
                  label="Add Account"
                  onPress={() => router.push("/(main)/finance/accounts/new")}
                />
              </View>
            </View>
          </>
        )}
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
  invertChangeColor = false,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  iconColor: string;
  invertChangeColor?: boolean;
}) {
  // For expenses, positive change is bad (red), negative is good (green)
  const isPositiveChange = invertChangeColor ? change < 0 : change > 0;
  const changeColor =
    change === 0
      ? "text-muted-foreground"
      : isPositiveChange
        ? "text-green-500"
        : "text-red-500";

  return (
    <View className="flex-1 rounded-xl bg-muted p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">{title}</Text>
        <FontAwesome name={icon} size={16} color={iconColor} />
      </View>
      <Text className="text-xl font-bold text-foreground">{value}</Text>
      {change !== 0 && (
        <Text className={`text-sm ${changeColor}`}>
          {change > 0 ? "+" : ""}
          {change.toFixed(1)}% vs last month
        </Text>
      )}
    </View>
  );
}

function RecentTransactionRow({
  transaction,
  isLast,
  onPress,
}: {
  transaction: Transaction;
  isLast: boolean;
  onPress: () => void;
}) {
  const amountColor = getTransactionColor(transaction.amount);

  return (
    <Pressable
      className={`flex-row items-center p-4 active:opacity-70 ${
        !isLast ? "border-b border-border" : ""
      }`}
      onPress={onPress}
    >
      <View
        className="h-8 w-8 items-center justify-center rounded-lg"
        style={{
          backgroundColor:
            (transaction.category?.color || Colors.mutedForeground) + "20",
        }}
      >
        <FontAwesome
          name={transaction.amount > 0 ? "arrow-down" : "arrow-up"}
          size={12}
          color={transaction.category?.color || Colors.mutedForeground}
        />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-medium text-foreground" numberOfLines={1}>
          {transaction.description}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {formatDate(transaction.date)}
          {transaction.category && ` \u2022 ${transaction.category.name}`}
        </Text>
      </View>
      <Text className="text-base font-semibold" style={{ color: amountColor }}>
        {transaction.amount > 0 ? "+" : ""}
        {formatCurrency(transaction.amount)}
      </Text>
    </Pressable>
  );
}

function QuickActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-1 items-center rounded-xl bg-primary/10 p-4 active:opacity-70"
      onPress={onPress}
    >
      <FontAwesome name={icon} size={24} color={Colors.primary} />
      <Text className="mt-2 text-sm font-medium text-primary">{label}</Text>
    </Pressable>
  );
}
