import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import { useTheme } from '@/context/ThemeContext';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items, getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();
  const { theme, toggleTheme } = useTheme();
  
  // Fix hydration issues by only rendering client-specific content after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative group">
            <div className="text-4xl font-extrabold tracking-wider font-heading">
              <span className="inline-block relative text-black dark:text-white
                             before:content-['NC'] before:absolute before:inset-0 before:text-accent
                             before:animate-pulse before:blur-[2px] before:opacity-70
                             after:content-['NC'] after:absolute after:inset-0 after:text-black dark:after:text-white
                             after:animate-pulse after:blur-[1px] after:opacity-90">
                NC
              </span>
            </div>
            <div className="absolute -bottom-1 left-0 w-0 h-1 bg-accent transition-all duration-300 group-hover:w-full"></div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent hover-accent font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent hover-accent font-medium">
              Products
            </Link>
            <Link href="/deals" className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent hover-accent font-medium">
              Deals
            </Link>
            <Link href="/support" className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent hover-accent font-medium">
              Support
            </Link>
          </nav>

          {/* Search, Cart, Theme Toggle, and User Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="text-gray-800 hover:text-cyan-500 dark:text-gray-200 dark:hover:text-cyan-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover-accent"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            <Link href="/cart" className="relative text-gray-800 hover:text-cyan-500 dark:text-gray-200 dark:hover:text-cyan-500 hover-accent">
              <FiShoppingCart size={24} />
              {isClient && cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isClient && isAuthenticated ? (
              <div className="relative">
                <button 
                  className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <FiUser size={24} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                    <Link href="/account" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                      My Account
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white">
                <FiUser size={24} />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Theme Toggle Button (Mobile) */}
            <button 
              onClick={toggleTheme} 
              className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white p-1"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>
            
            <button
              className="text-gray-700 dark:text-gray-300 focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 dark:bg-gray-900">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>

            <nav className="flex flex-col space-y-2">
              <Link
                href="/"
                className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 hover-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 hover-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/deals"
                className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 hover-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Deals
              </Link>
              <Link
                href="/support"
                className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 hover-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
              <Link
                href="/cart"
                className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 flex items-center hover-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiShoppingCart size={20} className="mr-2" />
                Cart {isClient && cartItemCount > 0 && `(${cartItemCount})`}
              </Link>
              {isClient && isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 hover-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 hover-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 w-full hover-accent"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-800 hover:text-accent dark:text-gray-200 dark:hover:text-accent py-2 hover-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
