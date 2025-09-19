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
    { path: '/orders', label: 'Orders', icon: 'bx-shopping-bag' }
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
    <nav className="bg-black shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <i className="bx bx-library text-3xl text-white"></i>
              <span className="text-2xl font-bold text-white font-roboto">Library</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-">
            {(user?.role === 'member') && (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-8 py-[26px] text-base text-sm font-semibold transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <i className={`bx ${item.icon} text-lg`}></i>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
            
            {/* Admin Navigation */}
            {(user?.role === 'admin' || user?.role === 'assistant') && (
              <>
                <div className="border-l border-gray-600 h-8 mx-2"></div>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-8 py-[26px] text-base font-semibold text-sm transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <i className={`bx ${item.icon} text-lg`}></i>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* User Menu & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wishlist Icon - Only for members */}
            {user?.role === 'member' && (
              <Link
                to="/wishlist"
                className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                title="Wishlist"
              >
                <i className="bx bx-heart text-red-600 text-lg"></i>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <div className="text-xs text-gray-300 capitalize">{user.role}</div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  user.role === 'admin' ? 'bg-red-600' :
                  user.role === 'assistant' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <i className="bx bx-chevron-down text-white text-sm"></i>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <i className="bx bx-log-out text-lg"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-white hover:text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <i className={`bx ${isMenuOpen ? 'bx-x' : 'bx-menu'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold ${
                  isActive(item.path)
                    ? 'bg-white text-black'
                    : 'text-white hover:bg-gray-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <i className={`bx ${item.icon} text-xl`}></i>
                <span>{item.label}</span>
              </Link>
            ))}
            
            {/* Admin items for mobile */}
            {(user?.role === 'admin' || user?.role === 'assistant') && (
              <>
                <div className="border-t border-gray-700 my-4"></div>
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold ${
                      isActive(item.path)
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <i className={`bx ${item.icon} text-xl`}></i>
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
                  <i className="bx bx-heart text-xl"></i>
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
