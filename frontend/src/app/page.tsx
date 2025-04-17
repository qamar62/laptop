'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiStar, FiShoppingCart, FiMonitor, FiCpu, FiHardDrive, FiServer, FiLayers } from "react-icons/fi";
import { formatPrice } from '@/utils/priceFormatter';
import { getProducts, getCategories, Product, Category } from '@/services/productService';
import useCartStore from '@/store/useCartStore';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { addItem } = useCartStore();
  
  useEffect(() => {
    // Show toast after 3 seconds
    const toastTimer = setTimeout(() => {
      setShowToast(true);
    }, 3000);

    // Hide toast after 10 seconds
    const hideToastTimer = setTimeout(() => {
      setShowToast(false);
    }, 13000);

    return () => {
      clearTimeout(toastTimer);
      clearTimeout(hideToastTimer);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products and limit to 10
        const productsData = await getProducts({ limit: 10 });
        setFeaturedProducts(productsData);
        
        // Fetch categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data for homepage:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleAddToCart = (product: Product) => {
    const defaultImage = product.images && product.images.length > 0 ? 
      product.images.find(img => img.is_primary)?.image || product.images[0].image : 
      'https://placehold.co/300x200';
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: defaultImage,
      quantity: 1
    });
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="relative rounded-xl overflow-hidden mb-12 bg-gradient-to-r from-gray-900 to-black dark:from-gray-800 dark:to-gray-900 text-white">
          <div className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">Premium Laptops <span className="text-cyan-400">for Every Need</span></h1>
              <p className="text-lg mb-6">Discover the perfect balance of performance, design, and value.</p>
              <div className="flex space-x-4">
                <Link href="/products" className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md border-b-4 border-cyan-800 hover:border-b-2 hover:mb-[2px] active:border-b-0 active:mb-1 active:translate-y-1">
                  Shop Now
                </Link>
                <Link href="/deals" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md border-b-4 border-gray-900 hover:border-b-2 hover:mb-[2px] active:border-b-0 active:mb-1 active:translate-y-1">
                  View Deals
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <Image 
                src="https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=1000" 
                alt="Featured Laptop" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-lg" 
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Shop by <span className="text-cyan-500 dark:text-cyan-400">Category</span></h2>
            <Link href="/products" className="text-gray-700 hover:text-cyan-500 dark:text-gray-300 dark:hover:text-cyan-400 flex items-center font-medium transition-colors duration-200">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* Original categories from API */}
              {categories.slice(0, 4).map((category, index) => (
                <Link key={category.id} href={`/products?category=${category.slug}`} className="group">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center transition-all duration-300 transform group-hover:scale-[1.03] group-hover:shadow-lg border-b-4 border-transparent group-hover:border-cyan-500 dark:group-hover:border-cyan-400">
                    <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800 transition-colors duration-300">
                      {index === 0 ? <FiLayers className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /> : 
                       index === 1 ? <FiCpu className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /> : 
                       index === 2 ? <FiServer className="w-8 h-8 text-cyan-600 dark:text-cyan-400" /> : 
                       <FiHardDrive className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
              
              {/* Additional static categories */}
              <Link href="/products?category=gaming-pc" className="group">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center transition-all duration-300 transform group-hover:scale-[1.03] group-hover:shadow-lg border-b-4 border-transparent group-hover:border-cyan-500 dark:group-hover:border-cyan-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800 transition-colors duration-300">
                    <FiServer className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                    Gaming PC
                  </h3>
                </div>
              </Link>
              <Link href="/products?category=all-in-one" className="group">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center transition-all duration-300 transform group-hover:scale-[1.03] group-hover:shadow-lg border-b-4 border-transparent group-hover:border-cyan-500 dark:group-hover:border-cyan-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800 transition-colors duration-300">
                    <FiMonitor className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                    All in One
                  </h3>
                </div>
              </Link>
              <Link href="/products?category=desktops" className="group">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 text-center transition-all duration-300 transform group-hover:scale-[1.03] group-hover:shadow-lg border-b-4 border-transparent group-hover:border-cyan-500 dark:group-hover:border-cyan-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800 transition-colors duration-300">
                    <FiCpu className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                    Desktops
                  </h3>
                </div>
              </Link>
            </div>
          )}
        </section>

        {/* Featured Products */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Featured <span className="text-cyan-500 dark:text-cyan-400">Products</span></h2>
            <Link href="/products" className="text-gray-700 hover:text-cyan-500 dark:text-gray-300 dark:hover:text-cyan-400 flex items-center font-medium transition-colors duration-200">
              View All <FiChevronRight className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] group">
                  <Link href={`/products/${product.slug}`} className="block relative h-48 overflow-hidden">
                    <Image 
                      src={product.images && product.images.length > 0 ? 
                        product.images.find(img => img.is_primary)?.image || product.images[0].image : 
                        'https://placehold.co/300x200'} 
                      alt={product.name} 
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.sale_price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                        {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/products/${product.slug}`} className="text-lg font-semibold text-gray-800 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors duration-200">
                        {product.name}
                      </Link>
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        <FiStar className="text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{product.rating || '0.0'}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      {product.sale_price ? (
                        <div className="flex items-center">
                          <span className="text-xl font-bold text-gray-900 dark:text-white mr-2">
                            <sup>AED</sup>{formatPrice(product.sale_price)}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            <sup>AED</sup>{formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          <sup>AED</sup>{formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <Link 
                      href={`/products/${product.slug}`} 
                      className="block w-full text-center py-2 px-4 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white rounded-md font-medium transition-all duration-200 border-b-2 border-cyan-800 dark:border-cyan-900 hover:border-b-1 hover:mb-[1px] active:border-b-0 active:mb-0.5 active:translate-y-0.5"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Promotional Banner */}
        <section className="mb-16 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden shadow-md transition-colors duration-200">
          <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4 font-heading text-gray-900 dark:text-white">Special <span className="text-cyan-500 dark:text-cyan-400">Offer</span></h2>
              <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">Get up to 30% off on selected laptops. Limited time offer!</p>
              <Link href="/deals" className="px-6 py-3 font-semibold bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600 text-white rounded-md transition-all duration-200 border-b-4 border-cyan-800 dark:border-cyan-900 hover:border-b-2 hover:mb-[2px] active:border-b-0 active:mb-1 active:translate-y-1">
                Shop Deals
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Image 
                src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000" 
                alt="Special Offer" 
                width={500} 
                height={300} 
                className="rounded-lg shadow-lg" 
              />
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center font-heading text-gray-900 dark:text-white">Why <span className="text-cyan-500 dark:text-cyan-400">Choose Us</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-gray-800">
              <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-heading text-gray-800 dark:text-white transition-colors duration-200">Quality Products</h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">We offer only the highest quality laptops and electronics from trusted brands.</p>
            </div>
            <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-gray-800">
              <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-heading text-gray-800 dark:text-white transition-colors duration-200">Fast Shipping</h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Get your products delivered quickly and reliably.</p>
            </div>
            <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] bg-white dark:bg-gray-800">
              <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-heading text-gray-800 dark:text-white transition-colors duration-200">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">Your transactions are always safe and secure.</p>
            </div>
          </div>
        </section>
        </div>
      </div>

      {/* Bottom Toast for Special Offer */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 flex items-center space-x-4 border-l-4 border-cyan-500 dark:border-cyan-400 w-11/12 md:w-auto max-w-lg">
          <div className="bg-cyan-100 dark:bg-cyan-900 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">Special Offer!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Use code <span className="font-bold text-cyan-500 dark:text-cyan-400">NEWUSER20</span> for 20% off your first purchase!</p>
          </div>
          <button 
            onClick={() => setShowToast(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
