export type Discount = {
  amount: number;
  percentage: number;
};

export type Product = {
  id: number;
  slug?: string;
  title: string;
  srcUrl: string;
  gallery?: string[];
  price: number;
  discount: Discount;
  rating: number;
  description?: string;
  brand?: string;
  condition?: string;
  size?: string;
  stock?: number;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  subCategoryId?: number | null;
};
