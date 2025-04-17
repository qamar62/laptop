'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiHeart, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import useCartStore from '@/store/useCartStore';
import type { CartItem } from '@/types';

// Helper function to safely format prices
const formatPrice = (price: number | string): string => {
  const numPrice = Number(price);
  return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
};

const CartPage = () => {
  const { items, fetchCart, updateCartItem, removeCartItem, saveForLater, clearCart, getTotalItems } = useCartStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues by only rendering client-specific content after mount
  useEffect(() => {
    setIsClient(true);
    fetchCart();
    
    // Ensure all items have valid price values
    if (items && Array.isArray(items)) {
      const validatedItems = items.map(item => ({
        ...item,
        price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
        quantity: item.quantity || 1
      }));
      setCartItems(validatedItems);
    }
  }, [fetchCart, items]);

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity >= 1) {
      updateCartItem(itemId, quantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeCartItem(itemId);
  };

  const handleSaveForLater = (itemId: string) => {
    saveForLater(itemId);
  };

  const calculateSubtotal = () => {
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) return 0;
    return cartItems.reduce((total: number, item: CartItem) => {
      if (!item) return total;
      return total + (Number(item.price || 0) * (item.quantity || 1));
    }, 0);
  };

  // Shipping calculation (simplified for demo)
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 100 ? 0 : 10;
  };

  // Tax calculation (simplified for demo)
  const calculateTax = () => {
    return calculateSubtotal() * 0.07; // 7% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  if (!isClient) {
    return null; // Prevent hydration errors by not rendering anything on server
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white transition-colors duration-200">Shopping Cart</h1>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm text-center transition-colors duration-200">
          <div className="flex justify-center mb-6">
            <FiShoppingBag size={64} className="text-gray-300 dark:text-gray-600 transition-colors duration-200" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white transition-colors duration-200">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-200">Looks like you haven&apos;t added any items to your cart yet.</p>
          <Link href="/products" className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md inline-block border-b-4 border-cyan-800 dark:border-cyan-900 hover:border-b-2 hover:mb-[2px] active:border-b-0 active:mb-1 active:translate-y-1">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white transition-colors duration-200">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-200">
            <div className="hidden md:grid md:grid-cols-5 bg-gray-50 dark:bg-gray-700 p-4 border-b dark:border-gray-600 transition-colors duration-200">
              <div className="col-span-2 font-semibold text-gray-800 dark:text-gray-200">Product</div>
              <div className="font-semibold text-center text-gray-800 dark:text-gray-200">Price</div>
              <div className="font-semibold text-center text-gray-800 dark:text-gray-200">Quantity</div>
              <div className="font-semibold text-right text-gray-800 dark:text-gray-200">Total</div>
            </div>
            
            {cartItems.map((item) => (
              <div key={item.id} className="border-b dark:border-gray-600 last:border-b-0 p-4 transition-colors duration-200">
                <div className="md:grid md:grid-cols-5 md:gap-4 md:items-center">
                  {/* Product Info */}
                  <div className="flex items-center col-span-2 mb-4 md:mb-0">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                      <Image 
                        src={item.image || 'https://via.placeholder.com/150'} 
                        alt={item.name} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                    <div className="ml-4">
                      <Link href={`/products/`} className="font-semibold text-lg text-gray-800 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200">
                        {item.name}
                      </Link>
                      <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">Quantity: {item.quantity}</p>
                      <div className="flex mt-2 md:hidden">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-500 hover:text-red-500 text-sm flex items-center mr-4"
                        >
                          <FiTrash2 className="mr-1" size={14} />
                          Remove
                        </button>
                        <button 
                          onClick={() => handleSaveForLater(item.id)}
                          className="text-gray-500 hover:text-blue-500 text-sm flex items-center"
                        >
                          <FiHeart className="mr-1" size={14} />
                          Save for later
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="md:text-center mb-4 md:mb-0">
                    <div className="md:hidden text-sm text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Price:</div>
                    <span className="text-gray-800 dark:text-white transition-colors duration-200">${formatPrice(item.price)}</span>
                  </div>
                  
                  {/* Quantity */}
                  <div className="md:text-center mb-4 md:mb-0">
                    <div className="md:hidden text-sm text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Quantity:</div>
                    <div className="flex items-center md:justify-center">
                      <button 
                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-l-md p-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={14} className={item.quantity <= 1 ? 'opacity-50' : ''} />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                        className="border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-2 w-14 text-center focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-colors duration-200"
                        aria-label="Quantity"
                      />
                      <button 
                        className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-r-md p-2 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="md:text-right">
                    <div className="md:hidden text-sm text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Total:</div>
                    <span className="font-semibold text-gray-800 dark:text-white transition-colors duration-200">${formatPrice(Number(item.price) * item.quantity)}</span>

                    
                    <div className="hidden md:flex md:justify-end mt-2">
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 mr-4 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Remove"
                      >
                        <FiTrash2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleSaveForLater(item.id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Save for later"
                      >
                        <FiHeart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center transition-colors duration-200">
              <button 
                onClick={() => clearCart()}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <FiTrash2 className="mr-2" />
                Clear Cart
              </button>
              <Link href="/products" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white transition-colors duration-200">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Subtotal ({getTotalItems()} items)</span>
                <span className="text-gray-800 dark:text-white transition-colors duration-200">${formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Shipping</span>
                {calculateShipping() === 0 ? (
                  <span className="text-green-600 dark:text-green-400 transition-colors duration-200">Free</span>
                ) : (
                  <span className="text-gray-800 dark:text-white transition-colors duration-200">${formatPrice(calculateShipping())}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Tax</span>
                <span className="text-gray-800 dark:text-white transition-colors duration-200">${formatPrice(calculateTax())}</span>
              </div>
              <div className="border-t dark:border-gray-600 pt-4 flex justify-between font-bold transition-colors duration-200">
                <span className="text-gray-800 dark:text-white transition-colors duration-200">Total</span>
                <span className="text-gray-800 dark:text-white transition-colors duration-200">${formatPrice(calculateTotal())}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="border dark:border-gray-600 rounded-md p-2 w-full pr-24 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-colors duration-200"
                />
                <button className="absolute right-1 top-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 px-3 py-1 rounded text-sm text-gray-800 dark:text-white transition-colors duration-200">
                  Apply
                </button>
              </div>
            </div>
            
            <Link 
              href="/checkout" 
              className="block w-full bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white text-center py-3 rounded-md font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md border-b-4 border-cyan-800 dark:border-cyan-900 hover:border-b-2 hover:mb-[2px] active:border-b-0 active:mb-1 active:translate-y-1"
            >
              Proceed to Checkout
            </Link>
            
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              <p className="mb-2">We accept:</p>
              <div className="flex space-x-2">
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded transition-colors duration-200 flex items-center justify-center text-xs">Visa</div>
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded transition-colors duration-200 flex items-center justify-center text-xs">MC</div>
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded transition-colors duration-200 flex items-center justify-center text-xs">Amex</div>
                <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded transition-colors duration-200 flex items-center justify-center text-xs">PayPal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
