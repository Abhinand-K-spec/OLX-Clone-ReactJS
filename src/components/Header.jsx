import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { Search, Heart, ChevronDown, Menu, X, LogOut, User } from 'lucide-react';
import { FaPlus } from "react-icons/fa";

const Header = () => {
  const { currentUser, openAuthModal } = useAuth();
  const { 
    categories, 
    selectedCategory, 
    updateCategory, 
    updateSearchQuery, 
    toggleSellModal,
    searchQuery
  } = useProducts();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Toggle category dropdown
  const toggleCategoryDropdown = () => {
    setCategoryDropdownOpen(!categoryDropdownOpen);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateSearchQuery(searchTerm);
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    updateCategory(category);
    setCategoryDropdownOpen(false);
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    updateCategory('');
    setCategoryDropdownOpen(false);
  };

  // Handle sell button click
  const handleSellClick = () => {
    if (currentUser) {
      toggleSellModal();
    } else {
      openAuthModal('login');
    }
  };

  return (
    <header className="bg-white shadow-nav sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="https://statics.olx.in/external/base/img/olxLogo/olx_logo_2025.svg" 
                alt="OLX Logo" 
                className="h-8"
              />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-olx-blue hover:text-olx-dark-grey focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:justify-between md:flex-1">
            <div className="flex items-center space-x-4">
              {/* Category dropdown */}
              <div className="relative" ref={categoryMenuRef}>
                <button
                  type="button"
                  className="flex items-center px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey focus:outline-none"
                  onClick={toggleCategoryDropdown}
                >
                  {selectedCategory || 'All Categories'}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {categoryDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-fadeIn">
                    <div className="py-1">
                      <button
                        onClick={clearCategoryFilter}
                        className="block w-full text-left px-4 py-2 text-sm text-olx-blue hover:bg-olx-light-grey"
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="block w-full text-left px-4 py-2 text-sm text-olx-blue hover:bg-olx-light-grey"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search bar */}
              <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[300px]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Find Cars, Mobile Phones and more..."
                    className="w-full py-2 pl-10 pr-4 text-sm text-olx-blue bg-olx-light-grey rounded-md focus:outline-none focus:ring-2 focus:ring-olx-green"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center px-3 bg-olx-blue text-white rounded-r-md"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-olx-dark-grey" />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link 
                to="/wishlist" 
                className="flex items-center px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey"
              >
                <Heart className="h-5 w-5 mr-1" />
                <span className="hidden lg:inline">Wishlist</span>
              </Link>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                {currentUser ? (
                  <>
                    <button
                      type="button"
                      className="flex items-center px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey focus:outline-none"
                      onClick={toggleUserMenu}
                    >
                      <User className="h-5 w-5 mr-1" />
                      <span className="hidden lg:inline">
                        {currentUser.email.split('@')[0]}
                      </span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-fadeIn">
                        <div className="py-1">
                          <Link
                            to="/my-ads"
                            className="block px-4 py-2 text-sm text-olx-blue hover:bg-olx-light-grey"
                          >
                            My Ads
                          </Link>
                          <Link
                            to="/wishlist"
                            className="block px-4 py-2 text-sm text-olx-blue hover:bg-olx-light-grey"
                          >
                            Wishlist
                          </Link>
                          <button
                            onClick={() => import('../services/firebase').then(({ logoutUser }) => logoutUser())}
                            className="block w-full text-left px-4 py-2 text-sm text-olx-blue hover:bg-olx-light-grey"
                          >
                            <div className="flex items-center">
                              <LogOut className="h-4 w-4 mr-2" />
                              Logout
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    className="flex items-center px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey focus:outline-none"
                    onClick={() => openAuthModal('login')}
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span>Login</span>
                  </button>
                )}
              </div>

              {/* Sell button */}
              <button
                onClick={handleSellClick}
                className="flex items-center gap-1 px-2 py-1 rounded-sm bg-app-ternary"
              ><FaPlus />
                <span>SELL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-fadeIn">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile search bar */}
              <form onSubmit={handleSearchSubmit} className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Find Cars, Mobile Phones and more..."
                    className="w-full py-2 pl-10 pr-4 text-sm text-olx-blue bg-olx-light-grey rounded-md focus:outline-none focus:ring-2 focus:ring-olx-green"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 flex items-center px-3 bg-olx-blue text-white rounded-r-md"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-olx-dark-grey" />
                  </div>
                </div>
              </form>

              {/* Category selection */}
              <div className="mb-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey focus:outline-none"
                  onClick={toggleCategoryDropdown}
                >
                  <span>{selectedCategory || 'All Categories'}</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                {categoryDropdownOpen && (
                  <div className="mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 animate-fadeIn">
                    <div className="py-1">
                      <button
                        onClick={clearCategoryFilter}
                        className="block w-full text-left px-4 py-2 text-sm text-olx-blue hover:bg-olx-light-grey"
                      >
                        All Categories
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="block w-full text-left px-4 py-2 text-sm text-olx-blue hover:bg-olx-light-grey"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile nav links */}
              <Link
                to="/wishlist"
                className="flex items-center px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-5 w-5 mr-2" />
                Wishlist
              </Link>

              {currentUser ? (
                <>
                  <Link
                    to="/my-ads"
                    className="flex items-center px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-2" />
                    My Ads
                  </Link>
                  <button
                    onClick={() => {
                      import('../services/firebase').then(({ logoutUser }) => logoutUser());
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-olx-blue rounded-md hover:bg-olx-light-grey"
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="h-5 w-5 mr-2" />
                  Login
                </button>
              )}

              {/* Mobile sell button */}
              <button
                onClick={() => {
                  handleSellClick();
                  setMobileMenuOpen(false);
                }}
                className='whitespace-nowrap py-2 px-6 text-base font-bold text-white rounded-full bg-gradient-to-r from-yellow-400 via-blue-500 to-teal-500 border-2 border-transparent'
              >
                SELL
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;