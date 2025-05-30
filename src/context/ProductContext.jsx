import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProducts, getWishlist } from '../services/firebase';
import { useAuth } from './AuthContext';

// Create the product context
const ProductContext = createContext();

// Custom hook to use the product context
export const useProducts = () => {
  return useContext(ProductContext);
};

// Product provider component
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([
    'Electronics', 'Vehicles', 'Property', 'Furniture', 
    'Fashion', 'Books & Hobbies', 'Pets', 'Services'
  ]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  
  const { currentUser } = useAuth();

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productData = await getProducts(selectedCategory, searchQuery);
      setProducts(productData);
      filterProducts(productData, selectedCategory, searchQuery);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's wishlist
  const fetchWishlist = async () => {
    if (currentUser) {
      try {
        const wishlistItems = await getWishlist();
        setWishlist(wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    } else {
      setWishlist([]);
    }
  };

  // Filter products based on category and search query
  const filterProducts = (allProducts, category, query) => {
    let filtered = [...allProducts];
    
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }
    
    if (query) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  // Fetch products when component mounts or filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Fetch wishlist when user changes
  useEffect(() => {
    fetchWishlist();
  }, [currentUser]);

  // Toggle sell modal
  const toggleSellModal = () => {
    setSellModalOpen(prev => !prev);
  };

  // Update search query
  const updateSearchQuery = (query) => {
    setSearchQuery(query);
  };

  // Update category filter
  const updateCategory = (category) => {
    setSelectedCategory(category);
  };

  // Refresh products (used after adding a new product)
  const refreshProducts = () => {
    fetchProducts();
    if (currentUser) {
      fetchWishlist();
    }
  };

  // Value to be provided to consumers
  const value = {
    products: filteredProducts.length > 0 ? filteredProducts : products,
    wishlist,
    categories,
    selectedCategory,
    searchQuery,
    loading,
    sellModalOpen,
    toggleSellModal,
    updateSearchQuery,
    updateCategory,
    refreshProducts,
    fetchWishlist,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};