'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiChevronRight, FiMail, FiPackage, FiPrinter } from 'react-icons/fi';
import useCartStore from '@/store/useCartStore';

const OrderConfirmationPage = () => {
  const router = useRouter();
  const { clearCart } = useCartStore();
  
  // Mock order data - in a real app, this would come from API or URL params
  const orderData = {
    id: 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    total: 1299.99,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Standard Shipping',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    items: [
      {
        id: 1,
        name: 'MacBook Pro 13"',
        price: 1299.99,
        quantity: 1,
        image: '/images/products/macbook.jpg'
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States'
    }
  };

  // Clear the cart when the confirmation page loads
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-lg text-gray-600">
            Your order has been placed and is being processed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="font-bold">{orderData.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p>{orderData.date}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-4">Order Details</h2>
            
            <div className="border rounded-md overflow-hidden mb-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-md mr-4 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span>$5.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span>${(orderData.total * 0.07).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>${(orderData.total + 5 + orderData.total * 0.07).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Shipping Information</h3>
              <div className="text-gray-600">
                <p>{orderData.shippingAddress.name}</p>
                <p>{orderData.shippingAddress.street}</p>
                <p>
                  {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.postalCode}
                </p>
                <p>{orderData.shippingAddress.country}</p>
                <p className="mt-2">
                  <span className="font-medium text-gray-700">Method:</span> {orderData.shippingMethod}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Estimated Delivery:</span> {orderData.estimatedDelivery}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Payment Information</h3>
              <div className="text-gray-600">
                <p>{orderData.paymentMethod}</p>
                <p>**** **** **** 4242</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FiPrinter className="mr-2" />
              Print Receipt
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FiMail className="mr-2" />
              Email Receipt
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="mr-4">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-800 mb-1">Track Your Order</h3>
              <p className="text-blue-700 mb-3">
                You will receive an email with tracking information once your order ships.
              </p>
              <Link 
                href={`/account/orders/${orderData.id}`}
                className="text-blue-600 font-medium inline-flex items-center hover:underline"
              >
                View order status <FiChevronRight className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
