import api from './api';

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  quantity: number;
  price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  discount: number;
  tax: number;
  total: number;
  shipping_address: {
    id: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address: {
    id: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  shipping_address_id: string;
  billing_address_id: string;
  payment_method: string;
  coupon_code?: string;
}

export interface OrdersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

export interface CouponValidation {
  valid: boolean;
  discount_amount?: number;
  message?: string;
}

const OrderService = {
  getOrders: async (page = 1, pageSize = 10) => {
    const response = await api.get<OrdersResponse>('/orders/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  getOrder: async (orderNumber: string) => {
    const response = await api.get<Order>(`/orders/${orderNumber}/`);
    return response.data;
  },

  createOrder: async (data: CreateOrderData) => {
    const response = await api.post<Order>('/orders/', data);
    return response.data;
  },

  cancelOrder: async (orderNumber: string) => {
    const response = await api.post<Order>(`/orders/${orderNumber}/cancel/`);
    return response.data;
  },

  validateCoupon: async (code: string) => {
    const response = await api.post<CouponValidation>('/orders/validate-coupon/', { code });
    return response.data;
  },

  initiatePayment: async (orderNumber: string, paymentMethod: string) => {
    const response = await api.post(`/orders/${orderNumber}/payment/`, { payment_method: paymentMethod });
    return response.data;
  },

  confirmPayment: async (orderNumber: string, paymentId: string) => {
    const response = await api.post(`/orders/${orderNumber}/payment/${paymentId}/confirm/`);
    return response.data;
  }
};

export default OrderService;
