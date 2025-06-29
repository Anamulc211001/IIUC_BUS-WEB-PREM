import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Mail, CheckCircle, Wifi, WifiOff, ArrowLeft, Sparkles } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn, user, userProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or university ID
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  // Redirect if already logged in
  if (user && userProfile) {
    const dashboardRoutes = {
      student: '/student-dashboard',
      teacher: '/teacher-dashboard',
      admin: '/admin-dashboard',
    };
    return <Navigate to={dashboardRoutes[userProfile.role]} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.identifier.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔐 Starting login process...');
      
      // Add a timeout wrapper for the entire login process
      const loginPromise = signIn(formData.identifier, formData.password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login process timeout')), 15000)
      );

      const { error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Login error:', error);
        
        if (error.message?.includes('timeout')) {
          setError('Connection timeout. Please check your internet connection and try again.');
        } else if (error.message?.includes('confirmation')) {
          setError('Please check your email and click the confirmation link before signing in.');
        } else if (error.message?.includes('Invalid login credentials')) {
          setError('Invalid email/university ID or password. Please check your credentials.');
        } else {
          setError(error.message || 'Login failed. Please try again.');
        }
      } else {
        console.log('✅ Login successful, waiting for redirect...');
        // Don't set loading to false here - let the auth context handle it
        return;
      }
    } catch (err: any) {
      console.error('❌ Unexpected login error:', err);
      if (err.message?.includes('timeout')) {
        setError('Connection timeout. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }

    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern - Mobile Optimized */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      {/* Mobile-First Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Mobile Header - Compact */}
        <div className="flex-shrink-0 p-4 sm:p-6">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-medium">Back to Home</span>
          </Link>
        </div>

        {/* Main Content - Centered and Responsive */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-sm sm:max-w-md">
            
            {/* Header Section - Mobile Optimized */}
            <div className="text-center mb-6 sm:mb-8">
              {/* Logo Section - Compact for Mobile */}
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-30"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-white/20">
                    <img 
                      src="/iiuc.png" 
                      alt="IIUC"
                      className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                    />
                  </div>
                </div>
                <div className="h-6 sm:h-8 w-px bg-gradient-to-b from-transparent via-blue-300 to-transparent"></div>
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-30"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-white/20">
                    <Bus className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                  </div>
                </div>
              </div>
              
              {/* Title - Mobile Responsive */}
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm sm:text-base px-2">Sign in to access your IIUC Bus Dashboard</p>
            </div>

            {/* Login Form - Mobile-First Design */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8 mb-6">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                
                {/* Error Message - Mobile Optimized */}
                {error && (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-start space-x-3">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                    </div>
                    
                    {/* Connection issue help - Mobile Friendly */}
                    {error.includes('timeout') && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4 flex items-start space-x-3">
                        <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-700">
                          <p className="font-medium mb-1">Connection Issue</p>
                          <p className="text-xs sm:text-sm">Please check your internet connection and try again.</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Email verification reminder - Mobile Friendly */}
                    {error.includes('confirmation') && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-start space-x-3">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">Email Verification Required</p>
                          <p className="text-xs sm:text-sm">Please check your email and click the verification link.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Identifier Field - Mobile Optimized */}
                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email or University ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type="text"
                      id="identifier"
                      name="identifier"
                      value={formData.identifier}
                      onChange={handleChange}
                      placeholder="Enter your email or university ID"
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-base form-input"
                      required
                      disabled={isLoading}
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                {/* Password Field - Mobile Optimized */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-base form-input"
                      required
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button - Mobile Optimized */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base button-smooth"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link - Mobile Friendly */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>

            {/* Success Notice - Mobile Optimized */}
            <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-700">
                  <p className="font-semibold mb-1">Just Verified Your Email?</p>
                  <p className="text-xs sm:text-sm">Perfect! You can now sign in with your credentials.</p>
                </div>
              </div>
            </div>

            {/* Connection Status - Mobile Friendly */}
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Connected to IIUC Bus System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;