// types.ts
export interface ProductImage {
  id: number;
  image: string;
}

export interface Price {
  id: number;
  productId: number;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  deletedAt: string | null;
  stock: number; // Added stock to align with the schema
  images: { id: number; image: string; createdAt: string; deletedAt: string | null }[];
  prices: { id: number; productId: number; price: number; createdAt: string; deletedAt: string | null }[];
  categories: ProductCategory[]; // Updated to match your Prisma schema
}

export interface ProductCategory {
  id: number;
  name: string;
  parentCategoryId: number | null;
  createdAt: string;
  deletedAt: string | null;
}


export interface Category {
  id: number;
  name: string;
  parentCategoryId?: number | null;
  subcategories: Category[];
  createdAt: string;
  deletedAt?: string | null;
}

