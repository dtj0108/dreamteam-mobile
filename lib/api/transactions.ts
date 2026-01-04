import { del, get, post, put } from "../api";
import { Transaction } from "../types/finance";

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total?: number;
}

export interface CreateTransactionInput {
  account_id: string;
  category_id?: string;
  amount: number;
  date: string;
  description: string;
  notes?: string;
  is_transfer?: boolean;
}

export interface UpdateTransactionInput {
  account_id?: string;
  category_id?: string;
  amount?: number;
  date?: string;
  description?: string;
  notes?: string;
}

function buildQueryString(filters: TransactionFilters): string {
  const params = new URLSearchParams();
  if (filters.accountId) params.append("accountId", filters.accountId);
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.offset) params.append("offset", filters.offset.toString());
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionsResponse> {
  const query = buildQueryString(filters);
  return get<TransactionsResponse>(`/api/transactions${query}`);
}

export async function getTransaction(id: string): Promise<Transaction> {
  return get<Transaction>(`/api/transactions/${id}`);
}

export async function createTransaction(
  data: CreateTransactionInput
): Promise<Transaction> {
  return post<Transaction>("/api/transactions", data);
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput
): Promise<Transaction> {
  return put<Transaction>(`/api/transactions/${id}`, data);
}

export async function deleteTransaction(id: string): Promise<void> {
  return del(`/api/transactions/${id}`);
}
