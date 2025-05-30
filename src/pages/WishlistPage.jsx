import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';

const WishlistPage = () => {
  const { currentUser, openAuthModal } = useAuth();
  const { wishlist, fetchWishlist } = useProducts();

  // Fetch wishlist items when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchWishlist();
    }
  }, [currentUser]);

  // If user is not logged in, show login prompt
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-olx-light-grey py-8 px-4">
        <div className="container mx-auto">
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <Heart className="h-16 w-16 text-olx-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-olx-blue mb-2">Your Wishlist is Waiting</h2>
            <p className="text-olx-dark-grey mb-6">
              Login to view and manage your favorite items.
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
            <h1 className="text-2xl font-bold text-olx-blue">My Wishlist</h1>
          </div>
        </div>

        {/* Wishlist items */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <Heart className="h-16 w-16 text-olx-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-olx-blue mb-2">Your Wishlist is Empty</h2>
            <p className="text-olx-dark-grey mb-6">
              Save items you like by clicking the heart icon on any product.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-olx-blue text-white rounded-md hover:bg-olx-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olx-blue"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;