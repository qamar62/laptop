'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiFilter, FiX, FiStar, FiShoppingCart, FiChevronRight } from 'react-icons/fi';
import { formatPrice } from '@/utils/priceFormatter';
import useCartStore from '@/store/useCartStore';
import { getProducts, getCategories, getBrands, Product, Category, Brand } from '@/services/productService';

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'featured',
    search: searchParams.get('search') || '',
  });
  const { addItem } = useCartStore();

  useEffect(() => {
    setIsClient(true);
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData, brandsData] = await Promise.all([
          getProducts(),
          getCategories(),
          getBrands()
        ]);
        
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
        setBrands(brandsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const applyFilters = () => {
    if (!products.length) return;
    
    let filtered = [...products];
    
    if (filters.category) {
      filtered = filtered.filter(product => product.category.slug === filters.category);
    }
    
    if (filters.brand) {
      filtered = filtered.filter(product => product.brand.slug === filters.brand);
    }
    
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter(product => {
        // Handle both string and number price values
        const currentPrice = product.sale_price || product.price;
        const numericPrice = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
        return !isNaN(numericPrice) && numericPrice >= minPrice;
      });
    }
    
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter(product => {
        // Handle both string and number price values
        const currentPrice = product.sale_price || product.price;
        const numericPrice = typeof currentPrice === 'string' ? parseFloat(currentPrice) : currentPrice;
        return !isNaN(numericPrice) && numericPrice <= maxPrice;
      });
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          (product.short_description && product.short_description.toLowerCase().includes(searchTerm)) ||
          product.brand.name.toLowerCase().includes(searchTerm) ||
          product.category.name.toLowerCase().includes(searchTerm)
        );
      });
    }
    
    switch (filters.sort) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = a.sale_price || a.price;
          const priceB = b.sale_price || b.price;
          const numericA = typeof priceA === 'string' ? parseFloat(priceA) : priceA;
          const numericB = typeof priceB === 'string' ? parseFloat(priceB) : priceB;
          return numericA - numericB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = a.sale_price || a.price;
          const priceB = b.sale_price || b.price;
          const numericA = typeof priceA === 'string' ? parseFloat(priceA) : priceA;
          const numericB = typeof priceB === 'string' ? parseFloat(priceB) : priceB;
          return numericB - numericA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : (a.rating || 0);
          const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : (b.rating || 0);
          return ratingB - ratingA;
        });
        break;
      default:
        // Sort by featured
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }
    
    setFilteredProducts(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // For checkboxes, handle checked property
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      setFilters({ ...filters, [e.target.name]: e.target.checked });
    } else {
      setFilters({ ...filters, [e.target.name]: e.target.value });
    }
  };
  
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
    if (window.innerWidth < 768) {
      setShowFilter(false);
    }
  };
  
  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sort: 'featured',
      search: '',
    });
    setFilteredProducts(products);
  };
  
  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
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
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-6 dark:text-gray-400">
        <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
          Home
        </Link>
        <FiChevronRight className="mx-2 text-gray-500 dark:text-gray-400" size={14} />
        <span className="font-medium dark:text-gray-200">Products</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Section - Mobile Toggle */}
        <div className="md:hidden mb-4">
          <button 
            onClick={toggleFilter}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {showFilter ? (
              <>
                <FiX size={18} />
                <span>Hide Filters</span>
              </>
            ) : (
              <>
                <FiFilter size={18} />
                <span>Show Filters</span>
              </>
            )}
          </button>
        </div>
        
        {/* Filter Sidebar */}
        <div className={`md:w-1/4 lg:w-1/5 ${showFilter ? 'block' : 'hidden md:block'}`}>
          <div className="card bg-white dark:bg-gray-800 p-4 rounded-lg mb-6 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Filters</h2>
              <button 
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear All
              </button>
            </div>
            
            <form onSubmit={handleFilterSubmit}>
              {/* Categories */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.slug}>
                      {category.name} {category.count ? `(${category.count})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Brands */}
              <div className="mb-4">
                <label htmlFor="brand" className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Brand
                </label>
                <select
                  id="brand"
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name} {brand.count ? `(${brand.count})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Sort By */}
              <div className="mb-4">
                <label htmlFor="sort" className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Sort By
                </label>
                <select
                  id="sort"
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              
              {/* Search */}
              <div className="mb-4">
                <label htmlFor="search" className="block text-sm font-medium mb-2 dark:text-gray-300">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn-primary py-2 rounded-md font-medium transition-all"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="w-full mt-2 btn-accent py-2 rounded-md font-medium transition-all"
              >
                Reset Filters
              </button>
            </form>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="md:w-3/4 lg:w-4/5">
          <div>
            {loading ? (
              <div className="flex justify-center items-center w-full py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">{error}</h3>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-md mt-4"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-300">
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
                        {product.is_on_sale && product.sale_price && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            SALE
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
      </div>
    </div>
  );
};

export default ProductsPage;
