'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiChevronRight, FiMinus, FiPlus, FiCheck, FiAward, FiTruck } from 'react-icons/fi';
import { formatPrice } from '@/utils/priceFormatter';
import useCartStore from '@/store/useCartStore';
import { getProduct, getRelatedProducts } from '@/services/productService';
import { useNotification } from '@/context/NotificationContext';

// Simple component for the product detail page
const ProductDetailPage = ({ params }) => {
  const router = useRouter();
  const { addItem, clearCart } = useCartStore();
  const { showNotification } = useNotification();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = params;

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const productData = await getProduct(slug);
        setProduct(productData);
        
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0].id);
        }
        
        if (productData.id) {
          const relatedData = await getRelatedProducts(productData.id);
          setRelatedProducts(relatedData);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [slug]);

  // Handle quantity change
  const handleQuantityChange = (value) => {
    if (value >= 1 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  // Handle variant selection
  const handleVariantChange = (variantId) => {
    setSelectedVariant(variantId);
  };

  // Add to cart
  const handleAddToCart = () => {
    if (product && selectedVariant) {
      const variant = product.variants.find(v => v.id === selectedVariant);
      if (variant) {
        addItem({
          id: variant.id,
          name: product.name,
          price: variant.sale_price || variant.price,
          image: product.images?.[0]?.image || '',
          quantity: quantity,
        });
        showNotification('Product added to cart', 'success');
      }
    }
  };

  // Buy now
  const handleBuyNow = () => {
    if (product && selectedVariant) {
      clearCart();
      handleAddToCart();
      router.push('/checkout');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error || 'Product not found'}</p>
            <Link href="/" className="mt-4 inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="w-full bg-white dark:bg-gray-900 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <FiChevronRight className="mx-2" />
          <Link href="/products" className="hover:text-blue-600 dark:hover:text-blue-400">Products</Link>
          <FiChevronRight className="mx-2" />
          <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden h-96">
              {product.images && product.images.length > 0 && (
                <Image 
                  src={product.images[activeImageIndex]?.image || product.images[0].image} 
                  alt={product.name} 
                  fill
                  className="object-contain" 
                />
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button 
                    key={image.id} 
                    className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${index === activeImageIndex ? 'border-cyan-500' : 'border-gray-200'}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <Image 
                      src={image.image} 
                      alt={`${product.name} - Image ${index + 1}`} 
                      fill
                      className="object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={i < Math.floor(product.rating) ? 'fill-current' : ''} 
                  />
                ))}
              </div>
              <span className="text-gray-600 dark:text-gray-400 ml-2">{product.rating?.toFixed(1)} ({product.review_count} reviews)</span>
            </div>
            
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${formatPrice(product.sale_price || product.price)}
              {product.sale_price && (
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through ml-2">${formatPrice(product.price)}</span>
              )}
            </div>
            
            <p className="text-gray-700 dark:text-gray-300">{product.short_description}</p>
            
            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-white">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => (
                    <button
                      key={variant.id}
                      className={`px-4 py-2 rounded-md border ${
                        selectedVariant === variant.id 
                          ? 'bg-cyan-600 text-white' 
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                      onClick={() => handleVariantChange(variant.id)}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Quantity</h3>
              <div className="flex items-center">
                <button 
                  className="w-10 h-10 rounded-l-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  <FiMinus />
                </button>
                <input 
                  type="number" 
                  className="w-16 h-10 text-center border-y border-gray-200 dark:border-gray-700"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                  min="1"
                  max={product.stock}
                />
                <button 
                  className="w-10 h-10 rounded-r-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button 
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-6 rounded-md font-semibold"
                onClick={handleAddToCart}
              >
                <FiShoppingCart className="inline mr-2" />
                Add to Cart
              </button>
              <button 
                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 px-6 rounded-md font-semibold"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex space-x-8">
              <button 
                className={`py-4 text-lg font-medium border-b-2 ${
                  activeTab === 'description' 
                    ? 'border-cyan-500 text-cyan-600' 
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`py-4 text-lg font-medium border-b-2 ${
                  activeTab === 'specifications' 
                    ? 'border-cyan-500 text-cyan-600' 
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('specifications')}
              >
                Specifications
              </button>
              <button 
                className={`py-4 text-lg font-medium border-b-2 ${
                  activeTab === 'reviews' 
                    ? 'border-cyan-500 text-cyan-600' 
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
            </div>
          </div>

          {activeTab === 'description' && (
            <div className="prose max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Technical Specifications</h3>
                <ul className="space-y-3">
                  {product.specifications && product.specifications.map((spec, index) => (
                    <li key={index} className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span className="text-gray-600 dark:text-gray-400">{spec.name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold dark:text-white">Customer Reviews</h3>
                <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-md font-medium">
                  Write a Review
                </button>
              </div>
              <div className="space-y-6">
                {/* Sample review */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">John Doe</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={i < 4 ? 'fill-current' : ''} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2023-01-15</span>
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Great product!</h5>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">This laptop exceeded my expectations. Fast performance and great battery life.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                      {relatedProduct.images && relatedProduct.images.length > 0 && (
                        <Image 
                          src={relatedProduct.images[0].image} 
                          alt={relatedProduct.name} 
                          fill
                          className="object-cover" 
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">{relatedProduct.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{relatedProduct.brand?.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold dark:text-white">
                          ${formatPrice(relatedProduct.sale_price || relatedProduct.price)}
                        </span>
                        <div className="flex items-center">
                          <FiStar className="text-yellow-400 fill-yellow-400" size={14} />
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{relatedProduct.rating?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
