import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { addToWishlist, removeFromWishlist, checkIfInWishlist } from '../services/firebase';

const ProductCard = ({ product }) => {
  const { id, name, price, description, category, imageUrl, createdAt, userEmail } = product;
  const { currentUser, openAuthModal } = useAuth();
  const { fetchWishlist } = useProducts();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  // Format date
  const formattedDate = createdAt
    ? new Date(createdAt.seconds * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      })
    : 'Recent';

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (currentUser) {
        try {
          const inWishlist = await checkIfInWishlist(id);
          setIsInWishlist(inWishlist);
        } catch (error) {
          console.error('ProductCard: Error checking wishlist:', error.message);
          setError('Failed to load wishlist status.');
        }
      } else {
        setIsInWishlist(false);
      }
    };

    checkWishlist();
  }, [currentUser, id]);

  // Toggle wishlist
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        setIsInWishlist(false);
      } else {
        await addToWishlist(id);
        setIsInWishlist(true);
      }
      await fetchWishlist();
    } catch (error) {
      console.error('ProductCard: Error toggling wishlist:', error.message);
      setError(error.message);
      alert(error.message); // User feedback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link to={`/product/${id}`} className="group block">
      <div className="bg-white rounded-lg shadow-card overflow-hidden transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        {/* Product image */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-olx-light-grey">
              <span className="text-olx-dark-grey">No image</span>
            </div>
          )}

          {/* Featured badge */}
          {category === 'Featured' && (
            <div className="absolute top-2 left-2 bg-olx-yellow text-olx-blue text-xs font-bold px-2 py-1 rounded">
              FEATURED
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            disabled={isLoading}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isInWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white text-olx-blue hover:bg-gray-100'
            } shadow-sm transition-colors`}
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Product info */}
        <div className="p-4">
          {error && (
            <p className="text-red-500 text-xs mb-2">{error}</p>
          )}
          <div className="mb-1">
            <h3 className="text-lg font-bold text-olx-blue truncate">{name}</h3>
            <p className="text-xl font-bold text-olx-blue">{formattedPrice}</p>
          </div>

          <p className="text-sm text-gray-600 h-10 overflow-hidden">
            {description.length > 60 ? `${description.substring(0, 60)}...` : description}
          </p>

          <div className="mt-2 flex items-center justify-between text-xs text-olx-dark-grey">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Delhi</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;