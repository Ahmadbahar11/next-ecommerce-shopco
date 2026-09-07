import { Product } from "@/types/product.types";
import { getToken } from "./admin-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiSubCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  category?: { id: number; name: string; slug: string };
  productCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  subCategories: ApiSubCategory[];
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiProduct = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  srcUrl: string;
  gallery: string[];
  brand: string;
  condition: "new" | "used";
  size: string;
  price: number;
  discountPercentage: number;
  stock: number;
  status: "active" | "draft";
  rating: number;
  categoryId: number;
  category?: { id: number; name: string; slug: string };
  subCategoryId: number | null;
  subCategory?: { id: number; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = Omit<
  ApiProduct,
  "id" | "category" | "subCategory" | "createdAt" | "updatedAt" | "description"
> & { description: string };

export type CategoryInput = {
  name: string;
  slug: string;
  description?: string;
};

export type SubCategoryInput = {
  name: string;
  slug: string;
  description?: string;
  categoryId: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function toProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    srcUrl: p.srcUrl,
    gallery: p.gallery,
    price: p.price,
    discount: { amount: 0, percentage: p.discountPercentage },
    rating: p.rating,
    description: p.description ?? undefined,
    brand: p.brand,
    condition: p.condition,
    size: p.size,
    stock: p.stock,
    categoryId: p.categoryId,
    categoryName: p.category?.name,
    categorySlug: p.category?.slug,
    subCategoryId: p.subCategoryId,
  };
}

function toQuery(params?: Record<string, string | number | undefined>) {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  return entries.length
    ? "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&")
    : "";
}

export const api = {
  getCategories: () => request<ApiCategory[]>("/api/categories"),
  getCategory: (id: number) => request<ApiCategory>(`/api/categories/${id}`),
  createCategory: (data: CategoryInput) =>
    request<ApiCategory>("/api/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: number, data: Partial<CategoryInput>) =>
    request<ApiCategory>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id: number) =>
    request<void>(`/api/categories/${id}`, { method: "DELETE" }),

  getSubCategories: (params?: { categoryId?: number }) =>
    request<ApiSubCategory[]>(`/api/subcategories${toQuery(params)}`),
  getSubCategory: (id: number) => request<ApiSubCategory>(`/api/subcategories/${id}`),
  createSubCategory: (data: SubCategoryInput) =>
    request<ApiSubCategory>("/api/subcategories", { method: "POST", body: JSON.stringify(data) }),
  updateSubCategory: (id: number, data: Partial<SubCategoryInput>) =>
    request<ApiSubCategory>(`/api/subcategories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSubCategory: (id: number) =>
    request<void>(`/api/subcategories/${id}`, { method: "DELETE" }),

  getProducts: (params?: Record<string, string | number | undefined>) =>
    request<ApiProduct[]>(`/api/products${toQuery(params)}`),
  getProduct: (id: number) => request<ApiProduct>(`/api/products/${id}`),
  createProduct: (data: ProductInput) =>
    request<ApiProduct>("/api/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<ProductInput>) =>
    request<ApiProduct>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    request<void>(`/api/products/${id}`, { method: "DELETE" }),
};
