import api from './api';
import axios from 'axios';

// Types

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductImage {
  id: string;
  image: string;
  is_primary: boolean;
  alt_text: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  attributes: Record<string, string>;
  stock: number;
  is_default?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price: number | null;
  images: ProductImage[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
  };
  stock: number;
  rating: number;
  review_count: number;
  variants: ProductVariant[];
  features?: string[];
  related_products?: Product[] | string[];
  attribute_values?: Array<{
    id: string;
    attribute: {
      id: string;
      name: string;
      description?: string;
    };
    value: string;
  }>;
  is_featured?: boolean;
  is_on_sale?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

// Mock data for fallback
const mockProducts: Product[] = [
  {
    id: 'mock-1',
    name: 'Premium Laptop Pro',
    slug: 'premium-laptop-pro',
    description: 'A high-end laptop with the latest features.',
    short_description: 'High-performance laptop',
    price: 1299.99,
    sale_price: 1199.99,
    images: [{ id: 'img1', image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=1000', is_primary: true, alt_text: 'Laptop' }],
    category: { id: 'cat1', name: 'Laptops', slug: 'laptops' },
    brand: { id: 'brand1', name: 'TechBrand', slug: 'techbrand' },
    stock: 10,
    rating: 4.5,
    review_count: 120,
    variants: [],
    is_featured: true,
    is_on_sale: true
  },
  {
    id: 'mock-2',
    name: 'Budget Laptop',
    slug: 'budget-laptop',
    description: 'Affordable laptop for everyday use.',
    short_description: 'Budget-friendly laptop',
    price: 699.99,
    sale_price: null,
    images: [{ id: 'img2', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000', is_primary: true, alt_text: 'Budget Laptop' }],
    category: { id: 'cat1', name: 'Laptops', slug: 'laptops' },
    brand: { id: 'brand2', name: 'ValueTech', slug: 'valuetech' },
    stock: 15,
    rating: 4.0,
    review_count: 85,
    variants: [],
    is_featured: false,
    is_on_sale: false
  }
];

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Laptops', slug: 'laptops', count: 15 },
  { id: 'cat2', name: 'Accessories', slug: 'accessories', count: 25 },
  { id: 'cat3', name: 'Monitors', slug: 'monitors', count: 10 },
  { id: 'cat4', name: 'Components', slug: 'components', count: 30 }
];

const mockBrands: Brand[] = [
  { id: 'brand1', name: 'TechBrand', slug: 'techbrand', count: 12 },
  { id: 'brand2', name: 'ValueTech', slug: 'valuetech', count: 8 },
  { id: 'brand3', name: 'PremiumTech', slug: 'premiumtech', count: 5 },
  { id: 'brand4', name: 'BudgetTech', slug: 'budgettech', count: 10 }
];

// API Functions
export const getProducts = async (params?: Record<string, any>): Promise<Product[]> => {
  try {
    // Create a modified API instance without auth headers for public endpoints
    const publicApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const response = await publicApi.get<PaginatedResponse<Product>>('/products/products/', { params });
    // Check if we have results in the response
    if (response.data && response.data.results && response.data.results.length > 0) {
      console.log(`Successfully fetched ${response.data.results.length} products from backend`);
      return response.data.results;
    } else {
      console.error('Empty product data from backend');
      return mockProducts;
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return mock data as fallback
    console.log('Using mock product data as fallback');
    return mockProducts;
  }
};

export const getProduct = async (slug: string): Promise<Product> => {
  try {
    const response = await api.get(`/products/products/${slug}/`);
    if (response.data) {
      console.log(`Successfully fetched product ${slug} from backend`);
      return response.data as Product;
    } else {
      throw new Error('Empty product data from backend');
    }
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    // Find a mock product with matching slug or return the first mock product
    const mockProduct = mockProducts.find(p => p.slug === slug) || mockProducts[0];
    console.log('Using mock product data as fallback');
    return mockProduct;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    // Create a modified API instance without auth headers for public endpoints
    const publicApi = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const response = await publicApi.get<PaginatedResponse<Category>>('/products/categories/');
    if (response.data && response.data.results) {
      console.log(`Successfully fetched ${response.data.results.length} categories from backend`);
      return response.data.results;
    } else {
      throw new Error('Invalid category data from backend');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return mock categories as fallback
    console.log('Using mock category data as fallback');
    return mockCategories;
  }
};

export const getBrands = async (): Promise<Brand[]> => {
  try {
    const response = await api.get<PaginatedResponse<Brand>>('/products/brands/');
    if (response.data && response.data.results) {
      console.log(`Successfully fetched ${response.data.results.length} brands from backend`);
      return response.data.results;
    } else {
      throw new Error('Invalid brand data from backend');
    }
  } catch (error) {
    console.error('Error fetching brands:', error);
    // Return mock brands as fallback
    console.log('Using mock brand data as fallback');
    return mockBrands;
  }
};

export const getRelatedProducts = async (productId: string): Promise<Product[]> => {
  try {
    const response = await api.get(`/products/products/${productId}/related/`);
    if (response.data && Array.isArray(response.data)) {
      console.log(`Successfully fetched ${response.data.length} related products from backend`);
      return response.data as Product[];
    } else {
      throw new Error('Invalid related products data from backend');
    }
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    // Return filtered mock products as fallback (exclude the current product)
    console.log('Using mock related products data as fallback');
    return mockProducts.filter(p => p.id !== productId);
  }
};
