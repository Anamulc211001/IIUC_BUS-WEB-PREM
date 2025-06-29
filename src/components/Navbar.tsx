import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Menu, X, Clock, MapPin, Phone, Search, User, LogOut, Map } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Auto-close on route change (for SPA navigation)
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Auto-close menu after navigation
    setIsMobileMenuOpen(false);
  };

  const getDashboardRoute = () => {
    if (!userProfile) return '/login';
    
    switch (userProfile.role) {
      case 'student':
        return '/student-dashboard';
      case 'teacher':
        return '/teacher-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/login';
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    // Auto-close menu when clicking any link
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Section - Enhanced Mobile Responsiveness */}
          <Link 
            to="/" 
            onClick={handleLinkClick}
            className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0"
          >
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-lg opacity-30 transition-colors ${
                isScrolled ? 'bg-blue-400' : 'bg-white'
              }`}></div>
              <div className={`relative rounded-full p-1.5 sm:p-2 border transition-all ${
                isScrolled 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-white/10 backdrop-blur-sm border-white/20'
              }`}>
                <img 
                  src="/iiuc.png" 
                  alt="IIUC"
                  className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
                />
              </div>
            </div>
            
            {/* Desktop Logo Text - Full Title */}
            <div className="hidden md:block">
              <h1 className={`text-lg sm:text-xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                IIUC Bus Finder
              </h1>
              <p className={`text-xs sm:text-sm transition-colors ${
                isScrolled ? 'text-gray-600' : 'text-blue-200'
              }`}>
                Smart Transport Solution
              </p>
            </div>
            
            {/* Tablet Logo Text - Medium Title */}
            <div className="hidden sm:block md:hidden">
              <h1 className={`text-base sm:text-lg font-bold transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                IIUC Bus Finder
              </h1>
              <p className={`text-xs transition-colors ${
                isScrolled ? 'text-gray-600' : 'text-blue-200'
              }`}>
                Transport Solution
              </p>
            </div>
            
            {/* Mobile Logo Text - Full Title (Fixed) */}
            <div className="block sm:hidden">
              <h1 className={`text-sm font-bold transition-colors leading-tight ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>
                IIUC Bus Finder
              </h1>
              <p className={`text-xs transition-colors leading-tight ${
                isScrolled ? 'text-gray-600' : 'text-blue-200'
              }`}>
                Smart Transport
              </p>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <div className="hidden xl:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection('home')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Bus className="h-4 w-4" />
              <span>Home</span>
            </button>
            
            <button
              onClick={() => scrollToSection('search-filters')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
            
            <button
              onClick={() => scrollToSection('schedules')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Schedules</span>
            </button>
            
            <Link
              to="/routes"
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all hover:scale-105 ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Route Maps</span>
            </Link>
          </div>

          {/* Right Side Actions - Completely Redesigned for Mobile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Desktop User Authentication Section */}
            {user && userProfile ? (
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  to={getDashboardRoute()}
                  className={`flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg ${
                    isScrolled 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    isScrolled 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    isScrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`px-4 py-2 sm:px-6 sm:py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg ${
                    isScrolled 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Contact Button - Hidden on small screens */}
            <a
              href="tel:+880-31-2510500"
              className={`hidden lg:flex items-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg ${
                isScrolled 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700' 
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30'
              }`}
            >
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </a>

            {/* Mobile Contact Button - Compact */}
            <a
              href="tel:+880-31-2510500"
              className={`lg:hidden p-2.5 rounded-xl transition-all shadow-md ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100 border border-gray-200' 
                  : 'text-white hover:bg-white/10 border border-white/20'
              }`}
            >
              <Phone className="h-4 w-4" />
            </a>

            {/* Mobile Menu Button - Enhanced with User Indicator */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden relative p-2.5 rounded-xl transition-all shadow-md border ${
                isScrolled 
                  ? 'text-gray-700 hover:bg-gray-100 border-gray-200' 
                  : 'text-white hover:bg-white/10 border-white/20'
              }`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {/* User Status Indicator */}
              {user && userProfile && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
              
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ENHANCED Mobile Menu - Auto-Close Functionality */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop for click-outside detection */}
            <div 
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Container */}
            <div 
              ref={mobileMenuRef}
              className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl rounded-2xl overflow-hidden animate-fade-slide-up z-50"
            >
              <div className="max-h-[80vh] overflow-y-auto">
                <div className="p-4 space-y-3">
                  
                  {/* User Info Section - Compact */}
                  {user && userProfile && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 text-sm truncate">{userProfile.name}</p>
                          <p className="text-xs text-gray-600">{userProfile.university_id} • {userProfile.role}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links - Auto-close on click */}
                  <div className="space-y-1">
                    <button
                      onClick={() => scrollToSection('home')}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all text-sm font-medium"
                    >
                      <Bus className="h-4 w-4" />
                      <span>Home</span>
                    </button>
                    
                    <button
                      onClick={() => scrollToSection('search-filters')}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all text-sm font-medium"
                    >
                      <Search className="h-4 w-4" />
                      <span>Search Schedules</span>
                    </button>
                    
                    <button
                      onClick={() => scrollToSection('schedules')}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all text-sm font-medium"
                    >
                      <Clock className="h-4 w-4" />
                      <span>All Schedules</span>
                    </button>
                    
                    <Link
                      to="/routes"
                      onClick={handleLinkClick}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all text-sm font-medium"
                    >
                      <Map className="h-4 w-4" />
                      <span>Route Maps</span>
                    </Link>
                  </div>
                  
                  {/* Authentication Section - Auto-close on click */}
                  <div className="pt-3 border-t border-gray-200">
                    {user && userProfile ? (
                      <div className="space-y-2">
                        {/* Dashboard Button */}
                        <Link
                          to={getDashboardRoute()}
                          onClick={handleLinkClick}
                          className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg text-sm"
                        >
                          <User className="h-4 w-4" />
                          <span>Go to Dashboard</span>
                        </Link>

                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all border border-red-200 text-sm"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Welcome Message - Compact */}
                        <div className="text-center py-2">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">Welcome to IIUC Bus Finder</h3>
                          <p className="text-xs text-gray-600">Login or create account for personalized features</p>
                        </div>

                        {/* Authentication Buttons - Auto-close on click */}
                        <div className="space-y-2">
                          <Link
                            to="/login"
                            onClick={handleLinkClick}
                            className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-sm border border-blue-200 text-sm"
                          >
                            <User className="h-4 w-4" />
                            <span>Login</span>
                          </Link>
                          
                          <Link
                            to="/signup"
                            onClick={handleLinkClick}
                            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg text-sm"
                          >
                            <span>Sign Up</span>
                          </Link>
                        </div>

                        {/* Benefits List - Compact */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-1 text-xs">Account Benefits:</h4>
                          <ul className="text-xs text-green-700 space-y-0.5">
                            <li>• Personalized schedules</li>
                            <li>• Submit feedback</li>
                            <li>• Real-time notifications</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Close Menu Hint */}
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-center text-xs text-gray-500">
                      Tap outside or press ESC to close menu
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;