import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        const userData = await response.json();
        onLogin(userData);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-md w-full space-y-6 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20 relative z-10 fade-in">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl floating">
              <i className="bx bx-user-plus text-3xl text-white"></i>
            </div>
            
          </div>
          <h2 className="text-3xl font-black text-white mb-1">
            Join Us Today
          </h2>
          <p className="text-sm text-white/80 mb-2 " style={{animationDelay: '0.2s'}}>
            Create your <span className="text-gradient2 font-bold">LibraLink</span> account
          </p>
          <p className="text-[13px] text-white/60 " style={{animationDelay: '0.4s'}}>
            Or{' '}
            <Link to="/login" className="text-gradient2  hover:text-white font-semibold underline underline-offset-4 transition-all duration-300">
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div style={{animationDelay: '0.6s'}}>
              <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="modern-input pl-10"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div style={{animationDelay: '0.8s'}}>
              <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="modern-input pl-10"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div  style={{animationDelay: '1s'}}>
              <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="modern-input pl-10"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div style={{animationDelay: '1.2s'}}>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="modern-input pl-10"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{animationDelay: '1.4s'}}>
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 text-center p-4 rounded-2xl flex items-center justify-center space-x-2">
                <i className="bx bx-error-circle text-lg"></i>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div  style={{animationDelay: '1.6s'}}>
            <button
              type="submit"
              disabled={loading}
              className="w-full modern-btn modern-btn-accent flex items-center justify-center space-x-2 disabled:opacity-50 group"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-4 h-4"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <i className="bx bx-user-plus text-lg group-hover:scale-110 transition-transform duration-300"></i>
                  <span className="font-semibold">Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
