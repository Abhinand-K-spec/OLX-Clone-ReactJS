import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, Flag, ChevronLeft, MapPin, User, Clock, Phone } from 'lucide-react';
import { getProductById, checkIfInWishlist, addToWishlist, removeFromWishlist } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { currentUser, openAuthModal } = useAuth();
  const [product, setProduct] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPhone, setShowPhone] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProductById(id);
        setProduct(productData);

        if (currentUser) {
          const inWishlist = await checkIfInWishlist(id);
          setIsInWishlist(inWishlist);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError(error.message || 'Failed to load product details. The product may have been removed or is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, currentUser]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    return new Date(timestamp.seconds * 1000).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Toggle wishlist
  const handleWishlistToggle = async () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        setIsInWishlist(false);
      } else {
        await addToWishlist(id);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  // Show seller's phone number
  const togglePhone = () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    setShowPhone(!showPhone);
  };

  // Handle share button click
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} on OLX Clone`,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-olx-light-grey py-8 px-4">
        <div className="container mx-auto">
          <div className="bg-white rounded-lg shadow-card p-6 animate-pulse">
            <div className="h-96 bg-gray-300 rounded-md mb-6"></div>
            <div className="h-10 bg-gray-300 rounded mb-4"></div>
            <div className="h-8 bg-gray-300 rounded mb-6 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-6"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-olx-light-grey py-8 px-4">
        <div className="container mx-auto">
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <h2 className="text-2xl font-bold text-olx-blue mb-4">Product Not Found</h2>
            <p className="text-olx-dark-grey mb-6">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-olx-blue text-white rounded-md hover:bg-olx-blue/90"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-olx-light-grey py-8 px-4">
      <div className="container mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-olx-blue hover:text-olx-dark-grey"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to listings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product image */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="relative h-[350px] md:h-[500px] bg-gray-100 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="text-olx-dark-grey">No image available</div>
                )}
              </div>
            </div>
          </div>

          {/* Product details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-olx-blue">{product.name}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2 rounded-full ${isInWishlist
                        ? 'bg-red-500 text-white'
                        : 'bg-olx-light-grey text-olx-blue hover:bg-gray-200'
                      }`}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-olx-light-grey text-olx-blue hover:bg-gray-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-3xl font-bold text-olx-blue">
                  {formatPrice(product.price)}
                </h2>
                <div className="flex items-center mt-2 text-sm text-olx-dark-grey">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Delhi</span>
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Posted {formatDate(product.createdAt)}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olx-blue mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olx-blue mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-olx-dark-grey">Category</p>
                    <p className="text-olx-blue">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-olx-dark-grey">Condition</p>
                    <p className="text-olx-blue">Used - Good</p>
                  </div>
                </div>
              </div>

              <button
                onClick={togglePhone}
                className="w-full flex items-center justify-center px-4 py-3 bg-olx-blue text-white rounded-md hover:bg-olx-blue/90 transition-colors mb-4"
              >
                <Phone className="h-5 w-5 mr-2" />
                {showPhone ? '91234 56789' : 'Show Phone Number'}
              </button>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-olx-blue">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-olx-blue">
                      {product.userEmail ? product.userEmail.split('@')[0] : 'OLX User'}
                    </p>
                    <p className="text-sm text-olx-dark-grey">Member since Oct 2023</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card p-4">
              <button
                className="w-full flex items-center justify-center px-3 py-2 text-sm text-olx-blue hover:bg-olx-light-grey rounded-md"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report this ad
              </button>
            </div>
          </div>
        </div>

        {/* Similar listings */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-olx-blue mb-4">Similar Items</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-card overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                  Similar item coming soon
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-olx-blue truncate">Similar Product</h3>
                  <p className="text-xl font-bold text-olx-blue">₹ --,---</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;