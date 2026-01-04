import { useQuery } from "@tanstack/react-query";

import { CategoriesResponse, getCategories } from "../api/categories";

export const categoryKeys = {
  all: ["categories"] as const,
  list: () => [...categoryKeys.all, "list"] as const,
};

export function useCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: categoryKeys.list(),
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10, // Categories don't change often, cache for 10 min
  });
}

export function useCategoriesByType(type: "income" | "expense") {
  const { data, ...rest } = useCategories();

  return {
    ...rest,
    data: data?.categories.filter((c) => c.type === type) ?? [],
  };
}
