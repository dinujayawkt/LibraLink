import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:4000/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const userData = await response.json();
        onLogin(userData);
        
        // Redirect based on user role
        if (userData.role === 'admin' || userData.role === 'assistant') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/20">
        <div className="text-center">
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="bx bx-library text-3xl text-white"></i>
          </div>
          <h2 className="text-[40px] font-bold  text-white mb-2">
            Sign in to LibraLink
          </h2>
          <p className="text-[13px] text-white">
            Or   {'  '}
            <Link to="/register" className="font- text-[13px] text-white hover:text-gray-700 underline">
                &nbsp;Create A New Account
            </Link>
          </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[15px] font-semibold text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="modern-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[15px] font-semibold text-white mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="modern-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-base text-center bg-red-50 p-3 rounded-lg">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full modern-btn modern-btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <i className="bx bx-log-in text-lg"></i>
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
