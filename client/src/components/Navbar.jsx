import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'bx-home-alt' },
    { path: '/books', label: 'Browse Books', icon: 'bx-book-open' },
    { path: '/my-books', label: 'My Books', icon: 'bx-book' },
    { path: '/orders', label: 'Orders', icon: 'bx-shopping-bag' },
    { path: '/community', label: 'Community', icon: 'bx-group' },
    { path: '/recommendations', label: 'Recommendations', icon: 'bx-star' }
  ];

  const adminItems = [
    { path: '/admin', label: 'Admin Panel', icon: 'bx-cog' },
    { path: '/admin/books', label: 'Manage Books', icon: 'bx-library' },
    { path: '/admin/orders', label: 'Manage Orders', icon: 'bx-package' }
  ];

  if (user && user.role === 'admin') {
    adminItems.push({ path: '/admin/users', label: 'Manage Users', icon: 'bx-group' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-2 lg:px-3">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex items-center group flex-shrink-0 ml-[-150px] mr-[50px]">
            <Link to="/" className="flex items-center space-x-3 group-hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <i className="bx bx-library text-lg text-white"></i>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-lg font-bold text-white group-hover:text-gradient transition-all duration-300">
                  LibraLink
                </span>
                <div className="text-[10px] text-white/70 font-medium hidden sm:block">Digital Library</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {(user?.role === 'member') && (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2.5 px-5 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white text-black shadow'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <i className={`bx ${item.icon} text-sm`}></i>
                    <span className="hidden xl:block">{item.label}</span>
                  </Link>
                ))}
              </>
            )}
            
            {/* Admin Navigation */}
            {(user?.role === 'admin' || user?.role === 'assistant') && (
              <>
                <div className="border-l border-gray-600 h-6 mx-2"></div>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2.5 px-5 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white text-black shadow'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <i className={`bx ${item.icon} text-sm`}></i>
                    <span className="hidden xl:block">{item.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* User Menu & Actions */}
          <div className="flex items-center space-x-8 flex-shrink-0 mr-[-150px] ">
            {/* Wishlist Icon - Only for members */}
            {user?.role === 'member' && (
              <Link
                to="/wishlist"
                className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-full flex items-center justify-center transition-colors shadow-lg"
                title="Wishlist"
              >
                <i className="bx bxs-heart text-white text-sm"></i>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef} >
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                  user.role === 'admin' ? 'bg-red-600' :
                  user.role === 'assistant' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-white">{user.name}</div>
                  <div className="text-[10px] text-gray-300 capitalize">{user.role}</div>
                </div>
                <i className="bx bx-chevron-down text-white text-[10px]"></i>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <i className="bx bx-log-out text-sm"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <i className={`bx ${isMenuOpen ? 'bx-x' : 'bx-menu'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                  isActive(item.path)
                    ? 'bg-white text-black shadow'
                    : 'text-white/90 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className={`bx ${item.icon} text-sm`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Admin items for mobile */}
            {(user?.role === 'admin' || user?.role === 'assistant') && (
              <>
                <div className="border-t border-gray-700 my-2"></div>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                      isActive(item.path)
                        ? 'bg-white text-black shadow'
                        : 'text-white/90 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className={`bx ${item.icon} text-sm`}></i>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
            
            <div className="border-t border-gray-700 pt-4 mt-4">
              {/* Wishlist Link for Mobile - Only for members */}
              {user?.role === 'member' && (
                <Link
                  to="/wishlist"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold text-white hover:bg-gray-800 mb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <i className="bx bxs-heart text-xl"></i>
                  <span>Wishlist</span>
                </Link>
              )}

              {/* User Profile Section */}
              <div className="flex items-center space-x-3 px-4 py-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                  user.role === 'admin' ? 'bg-red-600' :
                  user.role === 'assistant' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-white">{user.name}</div>
                  <div className="text-sm text-gray-300 capitalize">{user.role}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-base font-semibold text-red-400 hover:bg-red-900 hover:text-white"
              >
                <i className="bx bx-log-out text-xl"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
