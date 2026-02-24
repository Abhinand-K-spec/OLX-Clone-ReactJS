import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import SellForm from './components/SellForm';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import WishlistPage from './pages/WishlistPage';
import MyAdsPage from './pages/myAdsPage';
import { useProducts } from './context/ProductContext';



// Footer component
const Footer = () => {

  return (

    <footer className="bg-olx-blue text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
          <div>
            <h3 className="text-lg font-bold mb-4">POPULAR CATEGORIES</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Cars</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Flats for rent</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Mobile Phones</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Jobs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">TRENDING SEARCHES</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Bikes</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Watches</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Books</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Dogs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">ABOUT US</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">About OLX Group</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">OLX People</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">OLX</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Help</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Sitemap</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Legal & Privacy information</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p><a className='linkedin' href="https://www.linkedin.com/in/abhinand-k-spec/" target='_blank'>Abhinand K.</a> © 2006-2023 OLX</p>
        </div>
      </div>
    </footer>
  );
};

// App wrapper with context providers
const AppWrapper = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <AppContent />
      </ProductProvider>
    </AuthProvider>
  );
};

// Main app content
const AppContent = () => {
  const { sellModalOpen, toggleSellModal } = useProducts();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/my-ads" element={<MyAdsPage />} />
          </Routes>
        </main>
        <Footer />
        <AuthModal />
        {sellModalOpen && <SellForm onClose={toggleSellModal} />}
      </div>
    </Router>
  );
};

export default AppWrapper;