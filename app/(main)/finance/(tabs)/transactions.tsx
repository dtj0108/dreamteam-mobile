import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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
import { useTransactions } from "@/lib/hooks/useTransactions";
import { getTransactionColor, Transaction } from "@/lib/types/finance";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Get start/end of current month
const getMonthRange = () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

// Group transactions by date
const groupByDate = (transactions: Transaction[]) => {
  const groups: { [date: string]: Transaction[] } = {};
  transactions.forEach((txn) => {
    const date = txn.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(txn);
  });
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
};

export default function TransactionsScreen() {
  const router = useRouter();
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();

  const monthRange = useMemo(() => getMonthRange(), []);

  const { data: accountsData } = useAccounts();
  const { data, isLoading, refetch, isRefetching } = useTransactions({
    accountId: selectedAccountId,
    startDate: monthRange.startDate,
    endDate: monthRange.endDate,
  });

  const transactions = data?.transactions ?? [];
  const accounts = accountsData?.accounts ?? [];

  // Calculate totals
  const { income, expenses, net } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((txn) => {
      if (txn.amount > 0) inc += txn.amount;
      else exp += Math.abs(txn.amount);
    });
    return { income: inc, expenses: exp, net: inc - exp };
  }, [transactions]);

  const groupedTransactions = useMemo(
    () => groupByDate(transactions),
    [transactions]
  );

  const hasTransactions = transactions.length > 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              Transactions
            </Text>
            <Text className="text-muted-foreground">Track income & expenses</Text>
          </View>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-primary"
            onPress={() => router.push("/finance/transactions/new")}
          >
            <FontAwesome name="plus" size={18} color="white" />
          </Pressable>
        </View>

        {/* Summary Cards */}
        <View className="mb-4 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-green-500/10 p-3">
            <Text className="text-sm text-green-600">Income</Text>
            <Text className="text-xl font-bold text-green-600">
              {formatCurrency(income)}
            </Text>
          </View>
          <View className="flex-1 rounded-xl bg-red-500/10 p-3">
            <Text className="text-sm text-red-600">Expenses</Text>
            <Text className="text-xl font-bold text-red-600">
              {formatCurrency(expenses)}
            </Text>
          </View>
          <View className="flex-1 rounded-xl bg-primary/10 p-3">
            <Text className="text-sm text-primary">Net</Text>
            <Text
              className={`text-xl font-bold ${
                net >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {net >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(net))}
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View className="mb-4 flex-row gap-2">
          <Pressable className="flex-row items-center rounded-lg bg-muted px-3 py-2">
            <FontAwesome name="calendar" size={14} color={Colors.mutedForeground} />
            <Text className="ml-2 text-sm text-muted-foreground">This Month</Text>
            <FontAwesome
              name="chevron-down"
              size={10}
              color={Colors.mutedForeground}
              style={{ marginLeft: 4 }}
            />
          </Pressable>
          <Pressable
            className="flex-row items-center rounded-lg bg-muted px-3 py-2"
            onPress={() => {
              // TODO: Open account picker
              setSelectedAccountId(undefined);
            }}
          >
            <FontAwesome name="filter" size={14} color={Colors.mutedForeground} />
            <Text className="ml-2 text-sm text-muted-foreground">
              {selectedAccountId
                ? accounts.find((a) => a.id === selectedAccountId)?.name
                : "All Accounts"}
            </Text>
            <FontAwesome
              name="chevron-down"
              size={10}
              color={Colors.mutedForeground}
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {/* Transaction List */}
        {!isLoading && (
          <>
            {hasTransactions ? (
              groupedTransactions.map(([date, txns]) => (
                <View key={date} className="mb-4">
                  <Text className="mb-2 text-sm font-medium uppercase text-muted-foreground">
                    {formatDate(date)}
                  </Text>
                  {txns.map((txn) => (
                    <TransactionRow
                      key={txn.id}
                      transaction={txn}
                      onPress={() => router.push(`/finance/transactions/${txn.id}`)}
                    />
                  ))}
                </View>
              ))
            ) : (
              /* Empty State */
              <View className="items-center py-8">
                <FontAwesome
                  name="exchange"
                  size={48}
                  color={Colors.mutedForeground}
                />
                <Text className="mt-4 text-lg font-medium text-foreground">
                  No transactions yet
                </Text>
                <Text className="mt-1 text-center text-muted-foreground">
                  Add your first transaction to start tracking
                </Text>
                <Pressable
                  className="mt-4 rounded-lg bg-primary px-6 py-3"
                  onPress={() => router.push("/finance/transactions/new")}
                >
                  <Text className="font-medium text-white">Add Transaction</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: Transaction;
  onPress: () => void;
}) {
  const amountColor = getTransactionColor(transaction.amount);

  return (
    <Pressable
      className="mb-2 flex-row items-center rounded-xl bg-muted p-4 active:opacity-70"
      onPress={onPress}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-lg"
        style={{
          backgroundColor:
            (transaction.category?.color || Colors.mutedForeground) + "20",
        }}
      >
        <FontAwesome
          name={
            transaction.amount > 0
              ? "arrow-down"
              : transaction.amount < 0
              ? "arrow-up"
              : "exchange"
          }
          size={16}
          color={transaction.category?.color || Colors.mutedForeground}
        />
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-medium text-foreground">
          {transaction.description}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {transaction.category?.name || "Uncategorized"}
          {transaction.account && ` • ${transaction.account.name}`}
        </Text>
      </View>
      <Text className="text-lg font-semibold" style={{ color: amountColor }}>
        {transaction.amount > 0 ? "+" : ""}
        {formatCurrency(transaction.amount)}
      </Text>
    </Pressable>
  );
}
