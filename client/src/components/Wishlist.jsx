import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

function Wishlist({ user }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, [user?._id]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // For now, we'll use localStorage to simulate wishlist per user
      const userKey = user?._id || user?.email || 'guest';
      const key = `wishlist:${userKey}`;

      // Clear legacy global wishlist if present
      if (localStorage.getItem('wishlist')) {
        localStorage.removeItem('wishlist');
      }

      const savedWishlist = localStorage.getItem(key);
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (bookId) => {
    const updatedWishlist = wishlist.filter(book => book._id !== bookId);
    setWishlist(updatedWishlist);
    const userKey = user?._id || user?.email || 'guest';
    localStorage.setItem(`wishlist:${userKey}`, JSON.stringify(updatedWishlist));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
      <div className="content-wrapper">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <i className="bx bx-heart text-3xl text-red-500 mr-3"></i>
            <h1 className="text-3xl font-bold text-black">My Wishlist</h1>
          </div>
          <p className="text-sm text-gray-600">Books you want to read</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bx bx-heart text-4xl text-red-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-black mb-2">Your wishlist is empty</h3>
            <p className="text-lg text-gray-600">Start adding books you want to read!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist.map((book) => (
              <div key={book._id} className="modern-card p-6 group hover:scale-105 transition-transform duration-200">
                <div className="text-center mb-6">
                  {/* Book Cover Image */}
                  <div className="w-32 h-48 mx-auto mb-4 rounded-lg overflow-hidden shadow-lg">
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                        <i className="bx bx-book text-4xl text-white"></i>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-black line-clamp-2 mb-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    by {book.author}
                  </p>
                  {book.category && (
                    <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                      {book.category}
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  {book.isbn && (
                    <div className="flex justify-between">
                      <span className="font-semibold">ISBN:</span> 
                      <span className="text-gray-800">{book.isbn}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Copies:</span> 
                    <span className="text-gray-800">{book.totalCopies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Available:</span> 
                    <span className="text-gray-800">{book.totalCopies - book.borrowedCount}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => removeFromWishlist(book._id)}
                    className="flex-1 modern-btn modern-btn-secondary flex items-center justify-center space-x-2"
                  >
                    <i className="bx bx-heart-broken text-lg"></i>
                    <span>Remove</span>
                  </button>
                  {book.totalCopies - book.borrowedCount > 0 && (
                    <button className="flex-1 modern-btn modern-btn-primary flex items-center justify-center space-x-2">
                      <i className="bx bx-plus text-lg"></i>
                      <span>Borrow</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
