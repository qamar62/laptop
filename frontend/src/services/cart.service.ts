import api from './api';

export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    image: string;
  };
  variant?: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
  };
  quantity: number;
  price: number;
  total_price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  subtotal: number;
  total: number;
}

export interface AddToCartData {
  product_id: string;
  variant_id?: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

const CartService = {
  getCart: async () => {
    const response = await api.get<Cart>('/cart/');
    return response.data;
  },

  addToCart: async (data: AddToCartData) => {
    const response = await api.post<Cart>('/cart/items/', data);
    return response.data;
  },

  updateCartItem: async (itemId: string, data: UpdateCartItemData) => {
    const response = await api.patch<Cart>(`/cart/items/${itemId}/`, data);
    return response.data;
  },

  removeCartItem: async (itemId: string) => {
    const response = await api.delete<Cart>(`/cart/items/${itemId}/`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete<Cart>('/cart/clear/');
    return response.data;
  },

  saveForLater: async (itemId: string) => {
    const response = await api.post(`/cart/items/${itemId}/save-for-later/`);
    return response.data;
  },

  getSavedItems: async () => {
    const response = await api.get('/cart/saved-items/');
    return response.data;
  },

  moveToCart: async (savedItemId: string) => {
    const response = await api.post(`/cart/saved-items/${savedItemId}/move-to-cart/`);
    return response.data;
  },

  removeSavedItem: async (savedItemId: string) => {
    const response = await api.delete(`/cart/saved-items/${savedItemId}/`);
    return response.data;
  }
};

export default CartService;
