import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:4000/api';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    myBorrowedBooks: 0,
    popularBooks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [booksResponse, popularResponse, myBooksResponse] = await Promise.all([
        fetch(`${API_BASE}/books?limit=1`),
        fetch(`${API_BASE}/books/popular`),
        fetch(`${API_BASE}/borrow/my`, { credentials: 'include' })
      ]);

      const booksData = await booksResponse.json();
      const popularData = await popularResponse.json();
      const myBooksData = await myBooksResponse.json();

      const activeBorrows = myBooksData.filter(book => book.status === 'borrowed');

      setStats({
        totalBooks: booksData.total || 0,
        availableBooks: booksData.items.reduce((sum, book) => sum + (book.totalCopies - book.borrowedCount), 0),
        myBorrowedBooks: activeBorrows.length,
        popularBooks: popularData.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white/80 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
      <div className="content-wrapper fade-in">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-black mb-4 slide-in-up">
            Welcome back, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p className="text-lg text-gray-600 slide-in-up" style={{animationDelay: '0.2s'}}>
            Discover, explore, and manage your digital library experience
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mt-6 slide-in-up" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="modern-card p-8 group hover:scale-105 transition-all duration-500 slide-in-up" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <i className="bx bx-library text-2xl text-white group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{stats.totalBooks}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">Total Books</h3>
                  <p className="text-3xl font-black text-gradient">{stats.totalBooks}</p>
                  <p className="text-sm text-gray-600">In our collection</p>
                </div>
              </div>
            </div>
          </div>

          <div className="modern-card p-8 group hover:scale-105 transition-all duration-500 slide-in-up" style={{animationDelay: '0.8s'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <i className="bx bx-check-circle text-2xl text-white group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{stats.availableBooks}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">Available Books</h3>
                  <p className="text-3xl font-black text-gradient">{stats.availableBooks}</p>
                  <p className="text-sm text-gray-600">Ready to borrow</p>
                </div>
              </div>
            </div>
          </div>

          <div className="modern-card p-8 group hover:scale-105 transition-all duration-500 slide-in-up" style={{animationDelay: '1s'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <i className="bx bx-book text-2xl text-white group-hover:scale-110 transition-transform duration-300"></i>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{stats.myBorrowedBooks}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">My Books</h3>
                  <p className="text-3xl font-black text-gradient">{stats.myBorrowedBooks}</p>
                  <p className="text-sm text-gray-600">Currently borrowed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-8 text-center slide-in-up" style={{animationDelay: '1.2s'}}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/books"
              className="modern-card p-8 text-center group hover:scale-110 transition-all duration-500 slide-in-up floating"
              style={{animationDelay: '1.4s'}}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <i className="bx bx-search text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gradient transition-all duration-300">Browse Books</h3>
              <p className="text-sm text-gray-600 group-hover:text-black transition-colors duration-300">Discover and explore our vast collection</p>
              <div className="mt-4 w-8 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mx-auto group-hover:w-12 transition-all duration-300"></div>
            </Link>

            <Link
              to="/my-books"
              className="modern-card p-8 text-center group hover:scale-110 transition-all duration-500 slide-in-up floating"
              style={{animationDelay: '1.6s'}}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <i className="bx bx-book text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gradient transition-all duration-300">My Books</h3>
              <p className="text-sm text-gray-600 group-hover:text-black transition-colors duration-300">Manage your borrowed books</p>
              <div className="mt-4 w-8 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto group-hover:w-12 transition-all duration-300"></div>
            </Link>

            <Link
              to="/orders"
              className="modern-card p-8 text-center group hover:scale-110 transition-all duration-500 slide-in-up floating"
              style={{animationDelay: '1.8s'}}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <i className="bx bx-shopping-bag text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gradient transition-all duration-300">Orders</h3>
              <p className="text-sm text-gray-600 group-hover:text-black transition-colors duration-300">Request and track new books</p>
              <div className="mt-4 w-8 h-1 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mx-auto group-hover:w-12 transition-all duration-300"></div>
            </Link>

            <Link
              to="/recommendations"
              className="modern-card p-8 text-center group hover:scale-110 transition-all duration-500 slide-in-up floating"
              style={{animationDelay: '2s'}}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                <i className="bx bx-star text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-3 group-hover:text-gradient transition-all duration-300">Recommendations</h3>
              <p className="text-sm text-gray-600 group-hover:text-black transition-colors duration-300">Personalized book suggestions</p>
              <div className="mt-4 w-8 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mx-auto group-hover:w-12 transition-all duration-300"></div>
            </Link>
          </div>
        </div>

        {/* Popular Books */}
        {stats.popularBooks.length > 0 && (
          <div className="modern-card p-8 slide-in-up" style={{animationDelay: '2.2s'}}>
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <i className="bx bx-trending-up text-xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-black">
                  Trending Books
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.popularBooks.map((book, index) => (
                <div key={book._id} className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20 hover:border-white/40">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-black truncate group-hover:text-gradient transition-all duration-300">
                        {book.title}
                      </h4>
                      <p className="text-sm text-gray-600 truncate mt-2 group-hover:text-black transition-colors duration-300">
                        by {book.author}
                      </p>
                    </div>
                    <div className="flex flex-col items-center ml-4">
                      <span className="text-2xl font-black text-gradient">
                        #{index + 1}
                      </span>
                      <div className="w-8 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mt-1"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500 group-hover:text-black transition-colors duration-300">
                      <i className="bx bx-bar-chart mr-2"></i>
                      <span>{book.borrowedCount} borrows</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bx bxs-star text-sm ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
