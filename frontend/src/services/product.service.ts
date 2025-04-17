import api from './api';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
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
  images: {
    id: string;
    image: string;
    alt_text: string;
    is_primary: boolean;
  }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number;
    sale_price: number | null;
    stock_quantity: number;
    attributes: {
      attribute: string;
      value: string;
    }[];
  }[];
  attributes: {
    attribute: string;
    value: string;
  }[];
  average_rating: number;
  review_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export interface ProductFilter {
  category?: string;
  brand?: string;
  price_min?: number;
  price_max?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

const ProductService = {
  getProducts: async (filters: ProductFilter = {}) => {
    const response = await api.get<ProductsResponse>('/products/', { params: filters });
    return response.data;
  },

  getProduct: async (slug: string) => {
    const response = await api.get<Product>(`/products/${slug}/`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  getBrands: async () => {
    const response = await api.get('/products/brands/');
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await api.get<ProductsResponse>('/products/', { 
      params: { is_featured: true } 
    });
    return response.data;
  },

  getRelatedProducts: async (productId: string) => {
    const response = await api.get<Product[]>(`/products/${productId}/related/`);
    return response.data;
  },

  addReview: async (productId: string, data: { rating: number; comment: string }) => {
    const response = await api.post(`/products/${productId}/reviews/`, data);
    return response.data;
  },

  getProductReviews: async (productId: string) => {
    const response = await api.get(`/products/${productId}/reviews/`);
    return response.data;
  }
};

export default ProductService;
