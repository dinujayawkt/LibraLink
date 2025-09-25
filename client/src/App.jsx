import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import MyBooks from './components/MyBooks';
import Orders from './components/Orders';
import AdminDashboard from './components/AdminDashboard';
import AdminBooks from './components/AdminBooks';
import AdminUsers from './components/AdminUsers';
import AdminOrders from './components/AdminOrders';
import Wishlist from './components/Wishlist';
import Community from './components/Community';
import CommunityChat from './components/CommunityChat';
import Recommendations from './components/Recommendations';
import Navbar from './components/Navbar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/" 
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/books" 
          element={user ? <BookList user={user} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/my-books" 
          element={user ? <MyBooks user={user} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/orders" 
          element={user ? <Orders user={user} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/wishlist" 
          element={user ? <Wishlist user={user} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/community" 
          element={user ? <Community user={user} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/community/:communityId" 
          element={user ? <CommunityChat user={user} /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/recommendations" 
          element={user ? <Recommendations user={user} /> : <Navigate to="/login" replace />} 
        />
          <Route 
            path="/admin" 
            element={user && (user.role === 'admin' || user.role === 'assistant') ? <AdminDashboard user={user} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/admin/books" 
            element={user && (user.role === 'admin' || user.role === 'assistant') ? <AdminBooks user={user} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/admin/users" 
            element={user && user.role === 'admin' ? <AdminUsers user={user} /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/admin/orders" 
            element={user && (user.role === 'admin' || user.role === 'assistant') ? <AdminOrders user={user} /> : <Navigate to="/" replace />} 
          />
        </Routes>
    </div>
  );
}

export default App;