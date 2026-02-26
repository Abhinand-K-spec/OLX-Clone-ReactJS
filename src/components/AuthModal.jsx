import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Smartphone, Mail } from 'lucide-react';
import { registerUser, loginUser, isConfigValid, signInWithGoogle } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import guitaImg from '../assets/guita.png';
import avatar from '../assets/avatar.png';
import loveImg from '../assets/love.png';
import googleImg from '../assets/google.png';

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, authMode, toggleAuthMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('options'); // 'options', 'email-form'
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [slideIndex, setSlideIndex] = useState(0);

  const carouselSlides = [
    {
      image: guitaImg,
      text: "Help us become one of the safest places to buy and sell"
    },
    {
      image: avatar,
      text: "Keep all your Favourites in one place"
    },
    {
      image: loveImg,
      text: "Keep your personal details private"
    }
  ];

  const nextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation rules
  const validatePassword = (password) => {
    if (authMode === 'signup') {
      return {
        length: password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        specialChar: /[!@#$%^&*]/.test(password)
      };
    }
    return { length: password.length >= 6 };
  };

  // Real-time validation
  useEffect(() => {
    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: !email
          ? 'Email is required'
          : !validateEmail(email)
            ? 'Please enter a valid email address'
            : ''
      }));
    }

    if (touched.password) {
      const passwordValidation = validatePassword(password);
      let passwordError = '';

      if (!password) {
        passwordError = 'Password is required';
      } else if (authMode === 'signup') {
        if (!passwordValidation.length) {
          passwordError = 'Password must be at least 6 characters';
        } else if (!passwordValidation.uppercase) {
          passwordError = 'Password must contain at least one uppercase letter';
        } else if (!passwordValidation.number) {
          passwordError = 'Password must contain at least one number';
        } else if (!passwordValidation.specialChar) {
          passwordError = 'Password must contain at least one special character';
        }
      } else if (!passwordValidation.length) {
        passwordError = 'Password must be at least 6 characters';
      }

      setErrors((prev) => ({ ...prev, password: passwordError }));
    }
  }, [email, password, authMode, touched]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, general: '' }));
    setLoading(true);

    // Final validation before submission
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    const isFormValid = emailValid &&
      passwordValid.length &&
      (authMode === 'login' || (
        passwordValid.uppercase &&
        passwordValid.number &&
        passwordValid.specialChar
      ));

    if (!isFormValid) {
      setErrors({
        email: !emailValid ? 'Please enter a valid email address' : '',
        password: !passwordValid.length ? 'Password must be at least 6 characters' :
          authMode === 'signup' && !passwordValid.uppercase ? 'Password must contain at least one uppercase letter' :
            authMode === 'signup' && !passwordValid.number ? 'Password must contain at least one number' :
              authMode === 'signup' && !passwordValid.specialChar ? 'Password must contain at least one special character' : '',
        general: 'Please fix the errors above before submitting'
      });
      setLoading(false);
      return;
    }

    try {
      if (!isConfigValid) {
        throw new Error('CONFIG_ERROR');
      }

      if (authMode === 'signup') {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
      closeAuthModal();
    } catch (error) {
      console.error('Authentication error:', error);
      let errorMessage = 'Authentication failed. Please try again.';

      if (error.message === 'CONFIG_ERROR') {
        errorMessage = 'Firebase is not configured correctly. Please update the .env file with valid credentials.';
      } else {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email already in use. Please login instead.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Invalid email or password.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later.';
            break;
        }
      }

      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrors((prev) => ({ ...prev, general: '' }));
    setLoading(true);
    try {
      await signInWithGoogle();
      closeAuthModal();
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Google Authentication failed.';
      if (error.message === 'CONFIG_ERROR') {
        errorMessage = 'Firebase is not configured correctly. Please check your .env file.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'SignIn popup closed by user.';
      }
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOptions = () => {
    setView('options');
    setErrors({ email: '', password: '', general: '' });
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[400px] rounded shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300 py-4 px-8">

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-6 w-6 text-gray-800" />
        </button>

        {view === 'options' ? (
          <div className="flex flex-col items-center">
            {/* Illustration Slot / Carousel Placeholder */}
            <div className="relative w-full flex flex-col items-center justify-center mt-8 mb-4">
              <div className="flex items-center justify-between w-full absolute top-[35%] -translate-y-1/2 px-0 z-10">
                <button
                  onClick={prevSlide}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-8 h-8 text-gray-400" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-8 h-8 text-gray-400" />
                </button>
              </div>
              <div className="w-32 h-32 mb-4 flex items-center justify-center transition-all duration-300">
                <img src={carouselSlides[slideIndex].image} alt="OLX Illustration" className="w-full h-full object-contain animate-in fade-in duration-500" />
              </div>
              <p className="text-base font-bold text-[#002f34] text-center px-4 leading-tight mb-4 min-h-[3rem] flex items-center justify-center animate-in fade-in duration-500">
                {carouselSlides[slideIndex].text}
              </p>

              {/* Carousel Dots */}
              <div className="flex space-x-1.5 mb-6">
                {carouselSlides.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-colors ${slideIndex === idx ? 'bg-[#3a77ff]' : 'bg-gray-300'}`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 flex items-center px-4 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors group relative"
              >
                <img src={googleImg} alt="Google" className="h-5 w-5 absolute left-4" />
                <span className="flex-grow text-center text-[#002f34] font-semibold">Continue with Google</span>
              </button>

              <button
                onClick={() => setView('email-form')}
                className="w-full h-12 flex items-center px-4 border-2 border-[#002f34] rounded bg-white hover:bg-gray-50 transition-colors group"
              >
                <Mail className="w-5 h-5 mr-3 text-[#002f34]" />
                <span className="flex-grow text-center text-[#002f34] font-bold">Continue with Email</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-14 text-center">
              <p className="text-[11px] text-gray-500 mb-2">All your personal details are safe with us.</p>
              <p className="text-[11px] text-gray-500 leading-normal">
                If you continue, you are accepting <span className="text-[#3a77ff] cursor-pointer">OLX Terms and Conditions and Privacy Policy</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col py-4">
            <button
              onClick={handleBackToOptions}
              className="text-[#3a77ff] hover:underline text-sm font-bold mb-6 flex items-center space-x-1"
            >
              <span>←</span> <span>Back to login options</span>
            </button>

            <h3 className="text-xl font-bold text-[#002f34] mb-6">
              {authMode === 'login' ? 'Login with Email' : 'Create Account'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  className={`w-full px-4 py-2 bg-gray-50 border-2 ${errors.email && touched.email ? 'border-red-500' : 'border-gray-200'} rounded focus:border-[#002f34] outline-none transition-all`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur('email')}
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  className={`w-full px-4 py-2 bg-gray-50 border-2 ${errors.password && touched.password ? 'border-red-500' : 'border-gray-200'} rounded focus:border-[#002f34] outline-none transition-all`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handleBlur('password')}
                />
                {errors.password && touched.password && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>
                )}
              </div>

              {authMode === 'signup' && (
                <div className="bg-gray-50 p-3 rounded text-xs text-gray-500 border border-gray-100">
                  <p className="font-bold mb-1">Password Strength:</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className={`flex items-center space-x-1 ${validatePassword(password).length ? 'text-olx-green' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${validatePassword(password).length ? 'bg-olx-green' : 'bg-gray-300'}`}></div>
                      <span>6+ characters</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${validatePassword(password).uppercase ? 'text-olx-green' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${validatePassword(password).uppercase ? 'bg-olx-green' : 'bg-gray-300'}`}></div>
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${validatePassword(password).number ? 'text-olx-green' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${validatePassword(password).number ? 'bg-olx-green' : 'bg-gray-300'}`}></div>
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${validatePassword(password).specialChar ? 'text-olx-green' : ''}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${validatePassword(password).specialChar ? 'bg-olx-green' : 'bg-gray-300'}`}></div>
                      <span>Symbol</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#002f34] text-white py-2.5 rounded font-bold hover:bg-[#002f34]/90 disabled:opacity-70 transition-colors mt-2"
              >
                {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Create Account'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  className="text-sm font-bold text-[#3a77ff] hover:underline"
                  onClick={toggleAuthMode}
                >
                  {authMode === 'login'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Login'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;