'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiStar, FiShoppingCart, FiClock, FiPercent, FiTag } from 'react-icons/fi';
import { formatPrice } from '@/utils/priceFormatter';
import useCartStore from '@/store/useCartStore';
import { getProducts, Product } from '@/services/productService';

const DealsPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();
  
  // Featured deals with countdown timers
  const [featuredDeals, setFeaturedDeals] = useState([
    {
      id: 1,
      title: "Spring Tech Sale",
      description: "Up to 40% off on premium laptops",
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?q=80&w=1000",
      discount: "40%",
      backgroundColor: "bg-gradient-to-r from-blue-500 to-purple-600"
    },
    {
      id: 2,
      title: "Gaming Laptops Flash Sale",
      description: "Limited time offers on gaming laptops",
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      image: "https://images.unsplash.com/photo-1603481546238-487240415921?q=80&w=1000",
      discount: "25%",
      backgroundColor: "bg-gradient-to-r from-red-500 to-orange-500"
    },
    {
      id: 3,
      title: "Business Laptops Deal",
      description: "Special pricing on business-class laptops",
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000",
      discount: "30%",
      backgroundColor: "bg-gradient-to-r from-green-500 to-teal-500"
    }
  ]);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<{[key: number]: {days: number, hours: number, minutes: number, seconds: number}}>({});

  useEffect(() => {
    setIsClient(true);
    
    const fetchDealProducts = async () => {
      setLoading(true);
      try {
        const allProducts = await getProducts();
        // Filter products that are on sale
        const onSaleProducts = allProducts.filter(product => 
          product.sale_price && product.is_on_sale
        );
        setDealProducts(onSaleProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching deals:', err);
        setError('Failed to load deals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDealProducts();
    
    // Initialize countdown timers
    calculateTimeLeft();
    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const calculateTimeLeft = () => {
    const newTimeLeft: {[key: number]: {days: number, hours: number, minutes: number, seconds: number}} = {};
    
    featuredDeals.forEach(deal => {
      const difference = deal.endDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        newTimeLeft[deal.id] = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      } else {
        newTimeLeft[deal.id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    });
    
    setTimeLeft(newTimeLeft);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.images && product.images.length > 0 ? 
        product.images.find(img => img.is_primary)?.image || product.images[0].image : 
        'https://placehold.co/300x200',
      quantity: 1
    });
    
    // Show toast notification (you can implement this based on your UI library)
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Special Deals & Offers</h1>
        <p className="text-gray-600 dark:text-gray-400">Discover amazing discounts on our premium laptops and accessories</p>
      </div>
      
      {/* Featured Deals with Countdown */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Featured Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDeals.map((deal) => (
            <div 
              key={deal.id} 
              className={`${deal.backgroundColor} rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105`}
            >
              <div className="relative h-48">
                <Image 
                  src={deal.image} 
                  alt={deal.title} 
                  fill
                  className="object-cover opacity-80" 
                />
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-red-600 font-bold px-3 py-1 rounded-full flex items-center">
                  <FiPercent className="mr-1" />
                  <span>{deal.discount} OFF</span>
                </div>
              </div>
              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{deal.title}</h3>
                <p className="mb-4">{deal.description}</p>
                
                {/* Countdown Timer */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <FiClock className="mr-2" />
                    <span className="font-medium">Ends in:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-black bg-opacity-30 rounded-md p-2">
                      <div className="text-xl font-bold">{timeLeft[deal.id]?.days || 0}</div>
                      <div className="text-xs">Days</div>
                    </div>
                    <div className="bg-black bg-opacity-30 rounded-md p-2">
                      <div className="text-xl font-bold">{timeLeft[deal.id]?.hours || 0}</div>
                      <div className="text-xs">Hours</div>
                    </div>
                    <div className="bg-black bg-opacity-30 rounded-md p-2">
                      <div className="text-xl font-bold">{timeLeft[deal.id]?.minutes || 0}</div>
                      <div className="text-xs">Mins</div>
                    </div>
                    <div className="bg-black bg-opacity-30 rounded-md p-2">
                      <div className="text-xl font-bold">{timeLeft[deal.id]?.seconds || 0}</div>
                      <div className="text-xs">Secs</div>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href="/products" 
                  className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Deal Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Shop by Deal Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Clearance Sale", icon: <FiTag size={24} />, color: "bg-red-100 dark:bg-red-900", textColor: "text-red-600 dark:text-red-300" },
            { name: "Bundle Offers", icon: <FiShoppingCart size={24} />, color: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-600 dark:text-blue-300" },
            { name: "Student Discounts", icon: <FiPercent size={24} />, color: "bg-green-100 dark:bg-green-900", textColor: "text-green-600 dark:text-green-300" },
            { name: "Limited Time Offers", icon: <FiClock size={24} />, color: "bg-purple-100 dark:bg-purple-900", textColor: "text-purple-600 dark:text-purple-300" },
          ].map((category, index) => (
            <Link href="/products" key={index} className="block">
              <div className={`${category.color} rounded-lg p-6 text-center transition-transform hover:scale-105`}>
                <div className={`${category.textColor} flex justify-center mb-4`}>
                  {category.icon}
                </div>
                <h3 className="font-medium text-gray-800 dark:text-white">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Deal Products */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Current Deals</h2>
          <Link 
            href="/products" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : dealProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <FiTag className="mx-auto text-gray-400 dark:text-gray-500" size={48} />
            <h3 className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">No deals available</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Check back soon for new deals and discounts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dealProducts.map((product) => (
              <div key={product.id} className="card bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
                <Link href={`/products/${product.slug}`}>
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                    <Image 
                      src={product.images && product.images.length > 0 ? 
                        product.images.find(img => img.is_primary)?.image || product.images[0].image : 
                        'https://placehold.co/300x200'} 
                      alt={product.name} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                    {product.sale_price && product.price && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {Math.round((1 - product.sale_price / product.price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center mb-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`${i < Math.floor(typeof product.rating === 'number' ? product.rating : 0) ? 'fill-current' : ''}`} 
                          size={16}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">{typeof product.rating === 'number' ? product.rating.toFixed(1) : '0.0'}</span>
                  </div>
                  <Link href={`/products/${product.slug}`} className="block">
                    <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{product.brand.name}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      {product.sale_price ? (
                        <div className="flex items-center">
                          <span className="text-gray-400 dark:text-gray-500 line-through mr-2"><sup>AED</sup>{formatPrice(product.price)}</span>
                          <span className="font-bold text-red-600 dark:text-red-400"><sup>AED</sup>{formatPrice(product.sale_price)}</span>
                        </div>
                      ) : (
                        <span className="font-bold dark:text-white"><sup>AED</sup>{formatPrice(product.price)}</span>
                      )}
                    </div>
                    {isClient && (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        aria-label="Add to cart"
                      >
                        <FiShoppingCart size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
