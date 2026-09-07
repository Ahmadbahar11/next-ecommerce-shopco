export type AdminProduct = {
  id: number;
  title: string;
  srcUrl: string;
  category: string;
  brand: string;
  condition: "new" | "used";
  size: string;
  price: number;
  discountPercentage: number;
  stock: number;
  status: "active" | "draft";
  rating: number;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  productCount: number;
};

export type NavLinkChild = {
  id: number;
  label: string;
  url: string;
};

export type NavLink = {
  id: number;
  label: string;
  url: string;
  children: NavLinkChild[];
};

export type AdminReview = {
  id: number;
  user: string;
  product: string;
  content: string;
  rating: number;
  date: string;
  status: "published" | "hidden";
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productTitle: string;
  quantity: number;
  price: number;
};

export type AdminOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  date: string;
};

export type AdminCustomer = {
  id: number;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  status: "active" | "blocked";
};
