import { get } from "../api";
import { Category } from "../types/finance";

export interface CategoriesResponse {
  categories: Category[];
}

export async function getCategories(): Promise<CategoriesResponse> {
  return get<CategoriesResponse>("/api/categories");
}

export async function getCategory(id: string): Promise<Category> {
  return get<Category>(`/api/categories/${id}`);
}
