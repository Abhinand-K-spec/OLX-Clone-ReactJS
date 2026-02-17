import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProducts, getWishlist } from '../services/firebase';
import { useAuth } from './AuthContext';


const ProductContext = createContext();


export const useProducts = () => {
  return useContext(ProductContext);
};


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
  const [error, setError] = useState(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);

  const { currentUser } = useAuth();


  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productData = await getProducts(selectedCategory, searchQuery);
      setProducts(productData);
      filterProducts(productData, selectedCategory, searchQuery);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


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


  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);


  useEffect(() => {
    fetchWishlist();
  }, [currentUser]);


  const toggleSellModal = () => {
    setSellModalOpen(prev => !prev);
  };


  const updateSearchQuery = (query) => {
    setSearchQuery(query);
  };


  const updateCategory = (category) => {
    setSelectedCategory(category);
  };


  const refreshProducts = () => {
    fetchProducts();
    if (currentUser) {
      fetchWishlist();
    }
  };


  const value = {
    products: filteredProducts.length > 0 ? filteredProducts : products,
    wishlist,
    categories,
    selectedCategory,
    searchQuery,
    loading,
    error,
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