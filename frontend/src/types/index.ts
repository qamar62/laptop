// Common types used throughout the application

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price?: number;
  image: string;
  images: string[];
  rating?: number;
  review_count?: number;
  variants: ProductVariant[];
  features?: string[];
  specifications?: Record<string, string>;
  category?: string;
  brand?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  image?: string;
  stock?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}
