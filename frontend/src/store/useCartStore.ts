import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  cart: {
    total_items: number;
    total_price: number;
  };
  addItem: (item: CartItem) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  clearError: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  fetchCart: () => void;
  updateCartItem: (id: string, quantity: number) => void;
  removeCartItem: (id: string) => void;
  saveForLater: (id: string) => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      cart: {
        total_items: 0,
        total_price: 0
      },

      addItem: (item: CartItem) => {
        const { items } = get();
        const existingItem = items.find(i => i.id === item.id);
        
        if (existingItem) {
          // If item exists, update quantity
          const updatedItems = items.map(i => 
            i.id === item.id 
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
          const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = updatedItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
          
          set({
            items: updatedItems,
            cart: {
              total_items: totalItems,
              total_price: totalPrice
            }
          });
        } else {
          // Add new item
          const newItems = [...items, item];
          const totalItems = newItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = newItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
          
          set({ 
            items: newItems,
            cart: {
              total_items: totalItems,
              total_price: totalPrice
            }
          });
        }
      },

      updateItemQuantity: (id: string, quantity: number) => {
        const { items } = get();
        
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const filteredItems = items.filter(item => item.id !== id);
          const totalItems = filteredItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = filteredItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
          
          set({ 
            items: filteredItems,
            cart: {
              total_items: totalItems,
              total_price: totalPrice
            }
          });
        } else {
          // Update quantity
          const updatedItems = items.map(item => 
            item.id === id ? { ...item, quantity } : item
          );
          const totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
          const totalPrice = updatedItems.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
          
          set({
            items: updatedItems,
            cart: {
              total_items: totalItems,
              total_price: totalPrice
            }
          });
        }
      },

      removeItem: (id: string) => {
        const { items } = get();
        const filteredItems = items.filter(item => item.id !== id);
        const totalItems = filteredItems.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = filteredItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        set({ 
          items: filteredItems,
          cart: {
            total_items: totalItems,
            total_price: totalPrice
          }
        });
      },

      clearCart: () => {
        set({ 
          items: [],
          cart: {
            total_items: 0,
            total_price: 0
          }
        });
      },

      clearError: () => {
        set({ error: null });
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
      },
      
      // Alias functions to match the cart page expectations
      fetchCart: () => {
        // This function just ensures the cart state is up-to-date
        // In a real app, this would fetch from an API
        const { items } = get();
        const totalItems = items.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
        
        set({
          cart: {
            total_items: totalItems,
            total_price: totalPrice
          }
        });
      },
      
      updateCartItem: (id: string, quantity: number) => {
        // Alias for updateItemQuantity
        const { updateItemQuantity } = get();
        updateItemQuantity(id, quantity);
      },
      
      removeCartItem: (id: string) => {
        // Alias for removeItem
        const { removeItem } = get();
        removeItem(id);
      },
      
      saveForLater: (id: string) => {
        // In a real app, this would move the item to a saved items list
        // For now, we'll just log it
        console.log(`Item ${id} saved for later`);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, cart: state.cart }),
    }
  )
);

export default useCartStore;
