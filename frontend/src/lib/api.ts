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

export type ApiLookupOption = {
  id: number;
  name: string;
  slug: string;
  productCount?: number;
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
  condition: string;
  size: string;
  price: number;
  discountPercentage: number;
  stock: number;
  status: string;
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

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type ApiOrderItem = {
  id: number;
  orderId: number;
  productId: number | null;
  productTitle: string;
  price: number;
  quantity: number;
};

export type ApiCustomer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: "active" | "blocked";
  createdAt: string;
  updatedAt: string;
  ordersCount?: number;
  totalSpent?: number;
  orders?: ApiOrder[];
};

export type ApiOrder = {
  id: number;
  orderNumber: string;
  customerId: number;
  customer: ApiCustomer;
  items: ApiOrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CheckoutInput = {
  customer: { name: string; email: string; phone?: string };
  shipping: { address: string; city: string; phone?: string };
  items: { productId: number; quantity: number }[];
};

export type CustomerUpdateInput = {
  name?: string;
  phone?: string;
  status?: "active" | "blocked";
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

  getProductBrands: () => request<ApiLookupOption[]>("/api/product-brands"),
  createProductBrand: (data: { name: string; slug?: string }) =>
    request<ApiLookupOption>("/api/product-brands", { method: "POST", body: JSON.stringify(data) }),
  updateProductBrand: (id: number, data: { name?: string; slug?: string }) =>
    request<ApiLookupOption>(`/api/product-brands/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProductBrand: (id: number) =>
    request<void>(`/api/product-brands/${id}`, { method: "DELETE" }),
  getProductConditions: () => request<ApiLookupOption[]>("/api/product-conditions"),
  createProductCondition: (data: { name: string; slug?: string }) =>
    request<ApiLookupOption>("/api/product-conditions", { method: "POST", body: JSON.stringify(data) }),
  updateProductCondition: (id: number, data: { name?: string; slug?: string }) =>
    request<ApiLookupOption>(`/api/product-conditions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProductCondition: (id: number) =>
    request<void>(`/api/product-conditions/${id}`, { method: "DELETE" }),
  getProductStatuses: () => request<ApiLookupOption[]>("/api/product-statuses"),
  createProductStatus: (data: { name: string; slug?: string }) =>
    request<ApiLookupOption>("/api/product-statuses", { method: "POST", body: JSON.stringify(data) }),
  updateProductStatus: (id: number, data: { name?: string; slug?: string }) =>
    request<ApiLookupOption>(`/api/product-statuses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProductStatus: (id: number) =>
    request<void>(`/api/product-statuses/${id}`, { method: "DELETE" }),

  getProducts: (params?: Record<string, string | number | undefined>) =>
    request<ApiProduct[]>(`/api/products${toQuery(params)}`),
  getProduct: (id: number) => request<ApiProduct>(`/api/products/${id}`),
  createProduct: (data: ProductInput) =>
    request<ApiProduct>("/api/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: number, data: Partial<ProductInput>) =>
    request<ApiProduct>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: number) =>
    request<void>(`/api/products/${id}`, { method: "DELETE" }),

  createOrder: (data: CheckoutInput) =>
    request<ApiOrder>("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  getOrders: (params?: { status?: string; search?: string }) =>
    request<ApiOrder[]>(`/api/orders${toQuery(params)}`),
  getOrder: (id: number) => request<ApiOrder>(`/api/orders/${id}`),
  updateOrderStatus: (id: number, status: OrderStatus) =>
    request<ApiOrder>(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

  getCustomers: (params?: { search?: string }) =>
    request<ApiCustomer[]>(`/api/customers${toQuery(params)}`),
  getCustomer: (id: number) => request<ApiCustomer>(`/api/customers/${id}`),
  updateCustomer: (id: number, data: CustomerUpdateInput) =>
    request<ApiCustomer>(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCustomer: (id: number) =>
    request<void>(`/api/customers/${id}`, { method: "DELETE" }),
};
