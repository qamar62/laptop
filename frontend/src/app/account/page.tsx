'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiPackage, FiHeart, FiCreditCard, FiMapPin, FiSettings, FiLogOut, FiEdit } from 'react-icons/fi';
import useAuthStore from '@/store/useAuthStore';

const AccountPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues by only rendering client-specific content after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if not authenticated, but only on client side
  useEffect(() => {
    // Only redirect after client-side hydration and a small delay
    // to prevent redirect loops during initial load
    if (isClient && !isAuthenticated) {
      const redirectTimer = setTimeout(() => {
        router.push('/login?redirect=account');
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isClient, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isClient || !isAuthenticated) {
    return null; // Don't render anything until client-side and authenticated
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <FiUser className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">{user?.first_name} {user?.last_name}</p>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiUser className="mr-3" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiPackage className="mr-3" />
                <span>Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'wishlist' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiHeart className="mr-3" />
                <span>Wishlist</span>
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'payment' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiCreditCard className="mr-3" />
                <span>Payment Methods</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'addresses' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiMapPin className="mr-3" />
                <span>Addresses</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center px-4 py-3 rounded-md ${
                  activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiSettings className="mr-3" />
                <span>Account Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 rounded-md text-red-600 hover:bg-red-50"
              >
                <FiLogOut className="mr-3" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:w-3/4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Profile Information</h2>
                  <button className="flex items-center text-blue-600 hover:text-blue-700">
                    <FiEdit className="mr-1" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">First Name</p>
                    <p className="font-medium">{user?.first_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Name</p>
                    <p className="font-medium">{user?.last_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email Address</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="font-medium">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-bold mb-4">Account Security</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-gray-500 text-sm">Last changed 3 months ago</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">Change</button>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border rounded-md">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-gray-500 text-sm">Not enabled</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">Enable</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold mb-6">My Orders</h2>
                
                {/* Sample orders - in a real app, these would come from an API */}
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #ORD-123456</p>
                        <p className="text-sm text-gray-500">Placed on June 15, 2023</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Delivered
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md mr-4"></div>
                        <div>
                          <p className="font-medium">MacBook Pro 13"</p>
                          <p className="text-gray-500 text-sm">Quantity: 1</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <p className="font-medium">Total: $1,299.99</p>
                        <Link href="/account/orders/123456" className="text-blue-600 hover:text-blue-700">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #ORD-789012</p>
                        <p className="text-sm text-gray-500">Placed on May 22, 2023</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Shipped
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-md mr-4"></div>
                        <div>
                          <p className="font-medium">Dell XPS 15</p>
                          <p className="text-gray-500 text-sm">Quantity: 1</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <p className="font-medium">Total: $1,499.99</p>
                        <Link href="/account/orders/789012" className="text-blue-600 hover:text-blue-700">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Empty state */}
                {false && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <FiPackage className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-4">When you place an order, it will appear here.</p>
                    <Link href="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
                
                {/* Sample wishlist items - in a real app, these would come from an API */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex">
                      <div className="w-20 h-20 bg-gray-100 rounded-md mr-4"></div>
                      <div className="flex-1">
                        <h3 className="font-medium">MacBook Pro 13"</h3>
                        <p className="text-blue-600 font-medium mb-2">$1,299.99</p>
                        <div className="flex space-x-2">
                          <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Add to Cart
                          </button>
                          <button className="text-xs border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex">
                      <div className="w-20 h-20 bg-gray-100 rounded-md mr-4"></div>
                      <div className="flex-1">
                        <h3 className="font-medium">Dell XPS 15</h3>
                        <p className="text-blue-600 font-medium mb-2">$1,499.99</p>
                        <div className="flex space-x-2">
                          <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                            Add to Cart
                          </button>
                          <button className="text-xs border border-gray-300 hover:bg-gray-50 px-3 py-1 rounded">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Empty state */}
                {false && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <FiHeart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">Save items you're interested in for later.</p>
                    <Link href="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Browse Products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Payment Methods</h2>
                  <button className="flex items-center text-blue-600 hover:text-blue-700">
                    <FiEdit className="mr-1" />
                    <span>Add New</span>
                  </button>
                </div>
                
                {/* Sample payment methods - in a real app, these would come from an API */}
                <div className="space-y-4">
                  <div className="border rounded-md p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-gray-200 rounded mr-4"></div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-gray-500">Expires 12/2025</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                      <button className="text-gray-500 hover:text-gray-700">Edit</button>
                      <button className="text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-gray-200 rounded mr-4"></div>
                      <div>
                        <p className="font-medium">Mastercard ending in 5678</p>
                        <p className="text-sm text-gray-500">Expires 08/2024</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">Set as Default</button>
                      <button className="text-gray-500 hover:text-gray-700">Edit</button>
                      <button className="text-red-500 hover:text-red-700">Remove</button>
                    </div>
                  </div>
                </div>
                
                {/* Empty state */}
                {false && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <FiCreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                    <p className="text-gray-500 mb-4">Add a payment method for faster checkout.</p>
                    <button className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Add Payment Method
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Addresses</h2>
                  <button className="flex items-center text-blue-600 hover:text-blue-700">
                    <FiEdit className="mr-1" />
                    <span>Add New</span>
                  </button>
                </div>
                
                {/* Sample addresses - in a real app, these would come from an API */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">Home</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default
                      </span>
                    </div>
                    <div className="text-gray-600 mb-4">
                      <p>John Doe</p>
                      <p>123 Main St</p>
                      <p>New York, NY 10001</p>
                      <p>United States</p>
                      <p className="mt-1">Phone: (123) 456-7890</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-gray-500 hover:text-gray-700 text-sm">Edit</button>
                      <button className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <p className="font-medium">Work</p>
                    </div>
                    <div className="text-gray-600 mb-4">
                      <p>John Doe</p>
                      <p>456 Park Ave</p>
                      <p>Boston, MA 02108</p>
                      <p>United States</p>
                      <p className="mt-1">Phone: (123) 456-7890</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm">Set as Default</button>
                      <button className="text-gray-500 hover:text-gray-700 text-sm">Edit</button>
                      <button className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                  </div>
                </div>
                
                {/* Empty state */}
                {false && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <FiMapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
                    <p className="text-gray-500 mb-4">Add an address for faster checkout.</p>
                    <button className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Account Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Email Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-start">
                        <input type="checkbox" className="mt-1 mr-3" defaultChecked />
                        <div>
                          <p className="font-medium">Order updates</p>
                          <p className="text-sm text-gray-500">Receive emails about your orders and shipping updates</p>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input type="checkbox" className="mt-1 mr-3" defaultChecked />
                        <div>
                          <p className="font-medium">Promotions and deals</p>
                          <p className="text-sm text-gray-500">Receive emails about sales, new products, and special offers</p>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input type="checkbox" className="mt-1 mr-3" />
                        <div>
                          <p className="font-medium">Product recommendations</p>
                          <p className="text-sm text-gray-500">Receive personalized product recommendations based on your interests</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-4">Privacy Settings</h3>
                    <div className="space-y-3">
                      <label className="flex items-start">
                        <input type="checkbox" className="mt-1 mr-3" defaultChecked />
                        <div>
                          <p className="font-medium">Use my purchase history for recommendations</p>
                          <p className="text-sm text-gray-500">Allow us to use your purchase history to provide better product recommendations</p>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input type="checkbox" className="mt-1 mr-3" defaultChecked />
                        <div>
                          <p className="font-medium">Store payment information</p>
                          <p className="text-sm text-gray-500">Securely save your payment methods for faster checkout</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t">
                    <h3 className="font-semibold mb-4 text-red-600">Danger Zone</h3>
                    <button className="text-red-600 hover:text-red-700 border border-red-300 hover:bg-red-50 px-4 py-2 rounded-md">
                      Delete Account
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      This will permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
