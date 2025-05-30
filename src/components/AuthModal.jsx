import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { registerUser, loginUser } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { authModalOpen, closeAuthModal, authMode, toggleAuthMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

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
      if (authMode === 'signup') {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
      closeAuthModal();
    } catch (error) {
      console.error('Authentication error:', error);
      let errorMessage = 'Authentication failed. Please try again.';
      
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
      
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </h3>
            <button
              type="button"
              className="text-white hover:text-gray-300 focus:outline-none"
              onClick={closeAuthModal}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-olx-blue mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className={`w-full px-3 py-2 border ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-olx-green focus:border-olx-green`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur('email')}
                  required
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-olx-blue mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className={`w-full px-3 py-2 border ${
                    errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-olx-green focus:border-olx-green`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={handleBlur('password')}
                  required
                />
                {errors.password && touched.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
                {authMode === 'signup' && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside">
                      <li className={validatePassword(password).length ? 'text-green-500' : ''}>
                        At least 6 characters
                      </li>
                      <li className={validatePassword(password).uppercase ? 'text-green-500' : ''}>
                        At least one uppercase letter
                      </li>
                      <li className={validatePassword(password).number ? 'text-green-500' : ''}>
                        At least one number
                      </li>
                      <li className={validatePassword(password).specialChar ? 'text-green-500' : ''}>
                        At least one special character
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={loading || (touched.email && errors.email) || (touched.password && errors.password)}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-olx-blue hover:bg-olx-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olx-blue ${
                    (loading || (touched.email && errors.email) || (touched.password && errors.password)) 
                      ? 'opacity-70 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {loading
                    ? 'Processing...'
                    : authMode === 'login'
                    ? 'Login'
                    : 'Create Account'}
                </button>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="text-sm text-olx-blue hover:underline focus:outline-none"
                    onClick={toggleAuthMode}
                  >
                    {authMode === 'login'
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Login'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;