import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Bus, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Mail, CheckCircle, Wifi, WifiOff, ArrowLeft, Sparkles, Key, Info, Settings, ExternalLink, Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn, user, userProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '', // Can be email or university ID
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [showEmailSetupGuide, setShowEmailSetupGuide] = useState(false);

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setForgotPasswordLoading(true);

    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Please enter your email address');
      setForgotPasswordLoading(false);
      return;
    }

    // Check for valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      setForgotPasswordLoading(false);
      return;
    }

    try {
      console.log('🔄 Attempting password reset for:', forgotPasswordEmail);
      
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co') {
        setForgotPasswordError('Email service is not configured. Please contact the administrator.');
        setShowEmailSetupGuide(true);
        setForgotPasswordLoading(false);
        return;
      }

      // First, check if the email exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('email', forgotPasswordEmail)
        .single();

      if (userError || !userData) {
        console.log('❌ Email not found in users table:', userError);
        setForgotPasswordError('No account found with this email address. Please check your email or sign up for a new account.');
        setForgotPasswordLoading(false);
        return;
      }

      console.log('✅ Email found in users table, proceeding with reset...');

      // Attempt to send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });

      if (error) {
        console.error('❌ Password reset error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
          setForgotPasswordError('Too many password reset requests. Please wait 5 minutes before trying again.');
        } else if (error.message?.includes('not found') || error.message?.includes('user not found')) {
          setForgotPasswordError('No account found with this email address. Please check your email or sign up for a new account.');
        } else if (error.message?.includes('email not confirmed')) {
          setForgotPasswordError('Your email address is not verified. Please check your email for the verification link first.');
        } else if (error.message?.includes('smtp') || error.message?.includes('email') || error.message?.includes('service')) {
          setForgotPasswordError('Email service is not configured. Please contact the administrator.');
          setShowEmailSetupGuide(true);
        } else {
          setForgotPasswordError(`Password reset failed: ${error.message}. Please try again or contact support.`);
          setShowEmailSetupGuide(true);
        }
      } else {
        console.log('✅ Password reset email sent successfully');
        setForgotPasswordSuccess(`Password reset instructions have been sent to ${forgotPasswordEmail}. Please check your email (including spam folder) and follow the instructions. The link will expire in 1 hour.`);
        setForgotPasswordEmail('');
      }
    } catch (err: any) {
      console.error('❌ Unexpected password reset error:', err);
      setForgotPasswordError('An unexpected error occurred. Please check your internet connection and try again.');
    }

    setForgotPasswordLoading(false);
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
                {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base px-2">
                {showForgotPassword ? 'Enter your email to reset your password' : 'Sign in to access your IIUC Bus Dashboard'}
              </p>
            </div>

            {/* Login/Forgot Password Form - Mobile-First Design */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8 mb-6">
              
              {!showForgotPassword ? (
                // Login Form
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

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors flex items-center space-x-1 ml-auto"
                    >
                      <Key className="h-3 w-3" />
                      <span>Forgot Password?</span>
                    </button>
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
              ) : (
                // Forgot Password Form
                <form onSubmit={handleForgotPassword} className="space-y-5 sm:space-y-6">
                  
                  {/* Success Message */}
                  {forgotPasswordSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-green-700">
                        <p className="font-medium mb-1">Reset Email Sent!</p>
                        <p className="text-xs sm:text-sm leading-relaxed">{forgotPasswordSuccess}</p>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {forgotPasswordError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-start space-x-3">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-700">
                        <p className="font-medium mb-1">Reset Failed</p>
                        <p className="text-xs sm:text-sm leading-relaxed">{forgotPasswordError}</p>
                      </div>
                    </div>
                  )}

                  {/* Email Setup Guide */}
                  {showEmailSetupGuide && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4">
                      <div className="flex items-start space-x-3">
                        <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-800">
                          <p className="font-medium mb-2">⚙️ Email Service Setup Required</p>
                          <p className="text-xs mb-3">The administrator needs to configure Supabase email settings:</p>
                          <div className="space-y-1 text-xs">
                            <p>1. Go to Supabase Dashboard → Authentication → Settings</p>
                            <p>2. Configure SMTP settings or use Supabase's email service</p>
                            <p>3. Set up email templates for password reset</p>
                            <p>4. Enable email confirmations</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-orange-200">
                            <p className="font-medium text-xs">📧 Alternative Solutions:</p>
                            <div className="space-y-1 text-xs">
                              <p>• Contact admin directly for password reset</p>
                              <p>• Create a new account if needed</p>
                              <p>• Use university ID login if available</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label htmlFor="forgotPasswordEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="email"
                        id="forgotPasswordEmail"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="Enter your registered email address"
                        className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-base form-input"
                        required
                        disabled={forgotPasswordLoading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Password Reset Process</p>
                        <ul className="text-xs sm:text-sm space-y-1">
                          <li>• Enter the email address you used to register</li>
                          <li>• Check your email (including spam folder)</li>
                          <li>• Click the reset link within 1 hour</li>
                          <li>• Create a new password</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base button-smooth"
                  >
                    {forgotPasswordLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Sending Reset Email...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Send Reset Email</span>
                      </>
                    )}
                  </button>

                  {/* Back to Login */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                        setForgotPasswordError('');
                        setForgotPasswordSuccess('');
                        setShowEmailSetupGuide(false);
                      }}
                      className="text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span>Back to Login</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Sign Up Link - Mobile Friendly */}
              {!showForgotPassword && (
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
              )}
            </div>

            {/* Admin Setup Guide - Mobile Optimized */}
            {showEmailSetupGuide && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-purple-800">
                    <p className="font-semibold mb-2 flex items-center space-x-2">
                      <span>🔧 For Administrators</span>
                    </p>
                    <p className="text-xs mb-3">To enable password reset functionality, configure Supabase email settings:</p>
                    
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                      <p className="font-medium text-xs mb-2">📋 Quick Setup Steps:</p>
                      <ol className="text-xs space-y-1 list-decimal list-inside">
                        <li>Open your Supabase Dashboard</li>
                        <li>Go to Authentication → Settings → Email</li>
                        <li>Configure SMTP or use Supabase's email service</li>
                        <li>Enable "Confirm email" and "Reset password" templates</li>
                        <li>Test the configuration</li>
                      </ol>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <a
                        href="https://supabase.com/docs/guides/auth/auth-smtp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Supabase Email Docs</span>
                      </a>
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        <Settings className="h-3 w-3" />
                        <span>Supabase Dashboard</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success Notice - Mobile Optimized */}
            {!showForgotPassword && (
              <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700">
                    <p className="font-semibold mb-1">Just Verified Your Email?</p>
                    <p className="text-xs sm:text-sm">Perfect! You can now sign in with your credentials.</p>
                  </div>
                </div>
              </div>
            )}

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