import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, PackageOpen } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/firebase';

const MyAdsPage = () => {
  const { currentUser, openAuthModal } = useAuth();
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's products
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const allProducts = await getProducts();
        const filteredProducts = allProducts.filter(
          product => product.userId === currentUser.uid
        );
        setUserProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching user products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, [currentUser]);

  // If user is not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-olx-light-grey py-8 px-4">
        <div className="container mx-auto">
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <PackageOpen className="h-16 w-16 text-olx-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-olx-blue mb-2">View Your Ads</h2>
            <p className="text-olx-dark-grey mb-6">
              Login to manage your posted ads.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="px-6 py-3 bg-olx-blue text-white rounded-md hover:bg-olx-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olx-blue"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-olx-light-grey py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-olx-blue hover:text-olx-dark-grey">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-olx-blue">My Ads</h1>
          </div>
        </div>

        {/* User's ads */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-card overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : userProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <PackageOpen className="h-16 w-16 text-olx-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-olx-blue mb-2">No Ads Posted Yet</h2>
            <p className="text-olx-dark-grey mb-6">
              Start selling by posting your first ad.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-olx-yellow text-olx-blue rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olx-yellow"
            >
              Post an Ad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAdsPage;