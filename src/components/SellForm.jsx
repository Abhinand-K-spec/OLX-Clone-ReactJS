import React, { useState, useRef } from 'react';
import { X, Camera } from 'lucide-react';
import { addProduct } from '../services/firebase';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';

const SellForm = ({ onClose }) => {
  const navigate = useNavigate()
  const { categories, refreshProducts } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? value.replace(/[^\d]/g, '') : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name.trim()) {
      setError('Please enter a product name');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Please enter a product description');
      return;
    }
    
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    
    if (!formData.price || parseInt(formData.price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!image) {
      setError('Please upload an image');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const cleanedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseInt(formData.price),
      };

      console.log('Submitting product:', cleanedData);
      await addProduct(cleanedData, image);
      await refreshProducts();

      onClose();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      let errorMessage = 'Failed to add product. Please try again.';
      if (error.message === 'User not authenticated') {
        errorMessage = 'Please log in to post an ad';
      } else if (error.message === 'Image is required') {
        errorMessage = 'Please upload an image';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Check your network and try again';
      } else if (error.message.includes('Cloudinary upload failed')) {
        errorMessage = `Failed to upload image to Cloudinary: ${error.message.split(': ')[1] || 'Please try again'}`;
      } else if (error.message === 'Cloudinary cloud name is not configured') {
        errorMessage = 'Cloudinary configuration is missing. Contact support.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Check Firebase rules or login status';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-olx-blue px-4 py-3 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">
              Post Your Ad
            </h3>
            <button
              type="button"
              className="text-white hover:text-gray-300 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-olx-blue mb-2">
                  Upload Image (required)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div 
                    onClick={handleImageClick}
                    className={`h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 ${imagePreview ? 'border-olx-green' : 'border-gray-300'}`}
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <>
                        <Camera className="h-6 w-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Add Photo</span>
                      </>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload an image (max 5MB, required)
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-olx-blue mb-1">
                  Ad Title
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-olx-green focus:border-olx-green"
                  placeholder="Enter product title"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={70}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.name.length}/70 characters
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-olx-blue mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-olx-green focus:border-olx-green"
                  placeholder="Describe your item (condition, features, etc.)"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={4096}
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/4096 characters
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-olx-blue mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-olx-green focus:border-olx-green"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label htmlFor="price" className="block text-sm font-medium text-olx-blue mb-1">
                  Price (₹)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-olx-green focus:border-olx-green"
                    placeholder="0"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 text-sm font-medium text-olx-blue border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olx-green"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-olx-blue rounded-md shadow-sm hover:bg-olx-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olx-blue ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Posting...' : 'Post Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellForm;