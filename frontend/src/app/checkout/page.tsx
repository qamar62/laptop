'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCreditCard, FiLock } from 'react-icons/fi';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

// Mock user addresses
const mockAddresses = [
  {
    id: '1',
    name: 'John Doe',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'United States',
    phone: '(123) 456-7890',
    is_default: true
  },
  {
    id: '2',
    name: 'John Doe',
    street: '456 Park Ave',
    city: 'Boston',
    state: 'MA',
    postal_code: '02108',
    country: 'United States',
    phone: '(123) 456-7890',
    is_default: false
  }
];

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, items, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<{ id: string; name: string; street: string; city: string; state: string; postal_code: string; country: string; phone: string; is_default: boolean; }[]>([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState('');
  const [selectedBillingAddress, setSelectedBillingAddress] = useState('');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Fix hydration issues by only rendering client-specific content after mount
  useEffect(() => {
    setIsClient(true);
    
    // Fetch cart data
    fetchCart();
    
    // In a real app, fetch addresses from API
    // For now, use mock data
    setAddresses(mockAddresses);
    if (mockAddresses.length > 0) {
      const defaultAddress = mockAddresses.find(addr => addr.is_default) || mockAddresses[0];
      setSelectedShippingAddress(defaultAddress.id);
      setSelectedBillingAddress(defaultAddress.id);
    }
  }, [fetchCart]);

  // Redirect to login if not authenticated, but only on client side
  useEffect(() => {
    // Only redirect after client-side hydration and a small delay
    // to prevent redirect loops during initial load
    if (isClient && !isAuthenticated) {
      const redirectTimer = setTimeout(() => {
        router.push('/login?redirect=checkout');
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isClient, isAuthenticated, router]);

  const calculateSubtotal = () => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    if (shippingMethod === 'express') return 15;
    if (shippingMethod === 'standard') return 5;
    return 0;
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.07; // 7% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax() - discount;
  };

  const handleApplyCoupon = () => {
    // In a real app, validate coupon with API
    if (couponCode.toLowerCase() === 'discount10') {
      setCouponApplied(true);
      setDiscount(calculateSubtotal() * 0.1); // 10% discount
    }
  };

  const handleNextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = () => {
    // In a real app, submit order to API
    router.push('/checkout/confirmation');
  };

  if (!isClient || !isAuthenticated) {
    return null; // Don't render anything until client-side and authenticated
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="mb-6">You need to add items to your cart before checking out.</p>
        <Link href="/products" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>
      
      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              1
            </div>
            <span className={`mt-2 text-sm ${step === 1 ? 'font-semibold' : ''} dark:text-gray-300`}>Shipping</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              2
            </div>
            <span className={`mt-2 text-sm ${step === 2 ? 'font-semibold' : ''} dark:text-gray-300`}>Payment</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600 dark:bg-blue-700' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              3
            </div>
            <span className={`mt-2 text-sm ${step === 3 ? 'font-semibold' : ''} dark:text-gray-300`}>Review</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Checkout Form */}
        <div className="lg:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-6 dark:text-white">Shipping Information</h2>
                
                {/* Shipping Address Selection */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 dark:text-white">Select a shipping address</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div 
                        key={address.id} 
                        className={`border rounded-lg p-4 cursor-pointer ${selectedShippingAddress === address.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                        onClick={() => setSelectedShippingAddress(address.id)}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="shipping_address"
                            value={address.id}
                            checked={selectedShippingAddress === address.id}
                            onChange={() => setSelectedShippingAddress(address.id)}
                            className="mt-1 mr-3"
                          />
                          <div>
                            <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {address.street}<br />
                              {address.city}, {address.state} {address.postal_code}<br />
                              {address.country}<br />
                              {address.phone}
                            </div>
                            <div className="font-medium dark:text-white">{address.name}</div>
                            {address.is_default && (
                              <div className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                Default
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                      <button className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center">
                        <span className="mr-1">+</span> Add a new address
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Method */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 dark:text-white">Shipping method</h3>
                  
                  <div className="space-y-3">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${shippingMethod === 'standard' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                      onClick={() => setShippingMethod('standard')}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium dark:text-white">Standard Shipping</div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm">Delivery in 3-5 business days</div>
                        </div>
                        <div className="font-medium dark:text-white">$5.00</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${shippingMethod === 'express' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                      onClick={() => setShippingMethod('express')}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium dark:text-white">Express Shipping</div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm">Delivery in 1-2 business days</div>
                        </div>
                        <div className="font-medium dark:text-white">$15.00</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Billing Address */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 dark:text-white">Billing address</h3>
                  <div className="mb-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox h-5 w-5 text-blue-600" 
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                      />
                      <span className="ml-2 dark:text-gray-300">Same as shipping address</span>
                    </label>
                  </div>
                  
                  {!sameAsShipping && (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div 
                          key={address.id} 
                          className={`border rounded-lg p-4 cursor-pointer ${selectedBillingAddress === address.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                          onClick={() => setSelectedBillingAddress(address.id)}
                        >
                          <div className="flex items-start">
                            <input
                              type="radio"
                              name="billing_address"
                              value={address.id}
                              checked={selectedBillingAddress === address.id}
                              onChange={() => setSelectedBillingAddress(address.id)}
                              className="mt-1 mr-3"
                            />
                            <div>
                              <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                {address.street}<br />
                                {address.city}, {address.state} {address.postal_code}<br />
                                {address.country}<br />
                                {address.phone}
                              </div>
                              <div className="font-medium dark:text-white">{address.name}</div>
                              {address.is_default && (
                                <div className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                  Default
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                        <button className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center">
                          <span className="mr-1">+</span> Add a new address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleNextStep}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-md font-semibold"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-6 dark:text-white">Payment Information</h2>
                
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 dark:text-white">Select a payment method</h3>
                  
                  <div className="space-y-3">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                      onClick={() => setPaymentMethod('credit_card')}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium dark:text-white">Credit or Debit Card</div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm">Secure payment</div>
                        </div>
                        <div className="font-medium dark:text-white">
                          <FiCreditCard className="text-lg" />
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer ${paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium dark:text-white">PayPal</div>
                          <div className="text-gray-600 dark:text-gray-400 text-sm">You will be redirected to PayPal to complete your purchase</div>
                        </div>
                        <div className="font-medium dark:text-white">
                          <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/pp-acceptance-small.png" alt="PayPal" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Credit Card Form */}
                {paymentMethod === 'credit_card' && (
                  <div className="border rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold dark:text-white">Card Details</h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FiLock className="mr-1" />
                        <span>Secure payment</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="card_number"
                            placeholder="1234 5678 9012 3456"
                            className="w-full border border-gray-300 rounded-md p-2 pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                          />
                          <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="card_name" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                          Name on Card
                        </label>
                        <input
                          type="text"
                          id="card_name"
                          placeholder="John Doe"
                          className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="card_expiry" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                            Expiration Date (MM/YY)
                          </label>
                          <input
                            type="text"
                            id="card_expiry"
                            placeholder="MM/YY"
                            className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="card_cvc" className="block text-sm font-medium text-gray-700 mb-1 dark:text-white">
                            CVC
                          </label>
                          <input
                            type="text"
                            id="card_cvc"
                            placeholder="123"
                            className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-6 py-3 rounded-md font-semibold"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-md font-semibold"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Review Order */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold mb-6 dark:text-white">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 dark:text-white">Items in Your Order</h3>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="hidden md:grid md:grid-cols-4 bg-gray-50 dark:bg-gray-700 p-4 border-b">
                      <div className="col-span-2 font-medium dark:text-white">Product</div>
                      <div className="font-medium text-center dark:text-white">Quantity</div>
                      <div className="font-medium text-right dark:text-white">Price</div>
                    </div>
                    
                    {items.map((item) => (
                      <div key={item.id} className="border-b last:border-b-0 p-4">
                        <div className="md:grid md:grid-cols-4 md:gap-4 md:items-center">
                          <div className="flex items-center col-span-2 mb-2 md:mb-0">
                            <div className="w-16 h-16 bg-gray-100 rounded-md mr-4"></div>
                            <div>
                              <p className="font-medium dark:text-white">{item.name}</p>
                            </div>
                          </div>
                          
                          <div className="md:text-center mb-2 md:mb-0">
                            <div className="md:hidden text-sm text-gray-500 mb-1 dark:text-gray-400">Quantity:</div>
                            {item.quantity}
                          </div>
                          
                          <div className="md:text-right">
                            <div className="md:hidden text-sm text-gray-500 mb-1 dark:text-gray-400">Price:</div>
                            <span className="font-medium dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Shipping & Payment Info */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2">Shipping Information</h3>
                    {addresses.find(a => a.id === selectedShippingAddress) && (
                      <div>
                        <p>{addresses.find(a => a.id === selectedShippingAddress)?.name}</p>
                        <p>{addresses.find(a => a.id === selectedShippingAddress)?.street}</p>
                        <p>
                          {addresses.find(a => a.id === selectedShippingAddress)?.city}, 
                          {addresses.find(a => a.id === selectedShippingAddress)?.state} 
                          {addresses.find(a => a.id === selectedShippingAddress)?.postal_code}
                        </p>
                        <p>{addresses.find(a => a.id === selectedShippingAddress)?.country}</p>
                        <p className="mt-2 text-gray-600">
                          {shippingMethod === 'express' ? 'Express Shipping (1-2 business days)' : 'Standard Shipping (3-5 business days)'}
                        </p>
                      </div>
                    )}
                    <button 
                      onClick={() => setStep(1)}
                      className="text-blue-600 text-sm mt-2"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-semibold mb-2">Payment Information</h3>
                    {paymentMethod === 'credit_card' ? (
                      <div>
                        <p>Credit Card</p>
                        <p>**** **** **** {cardDetails.number.slice(-4)}</p>
                        <p>{cardDetails.name}</p>
                        <p>Expires: {cardDetails.expiry}</p>
                      </div>
                    ) : (
                      <p>PayPal</p>
                    )}
                    <button 
                      onClick={() => setStep(2)}
                      className="text-blue-600 text-sm mt-2"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-md font-semibold"
                  >
                    Back to Payment
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-semibold"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal ({cart.total_items} items)</span>
                <span className="dark:text-white">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="dark:text-white">${calculateShipping().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="dark:text-white">${calculateTax().toFixed(2)}</span>
              </div>
              
              {couponApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t dark:border-gray-700 pt-4 flex justify-between font-bold">
                <span className="dark:text-white">Total</span>
                <span className="dark:text-white">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            {/* Coupon Code */}
            {!couponApplied ? (
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    className="border rounded-md p-2 w-full pr-24"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button 
                    className="absolute right-1 top-1 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-3 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">Coupon applied: {couponCode}</p>
                  <p className="text-sm">10% discount</p>
                </div>
                <button 
                  className="text-sm underline"
                  onClick={() => {
                    setCouponApplied(false);
                    setCouponCode('');
                    setDiscount(0);
                  }}
                >
                  Remove
                </button>
              </div>
            )}
            
            <div className="text-sm text-gray-500 space-y-2">
              <p className="flex items-center">
                <FiLock className="mr-2" />
                Secure checkout
              </p>
              <p>
                By placing your order, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
