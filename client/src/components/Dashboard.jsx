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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
      <div className="content-wrapper">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-sm text-gray-600">
            Manage your library experience from here
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="modern-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                  <i className="bx bx-library text-lg text-white"></i>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    Total Books
                  </dt>
                  <dd className="text-2xl font-bold text-black">
                    {stats.totalBooks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="modern-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                  <i className="bx bx-check-circle text-lg text-white"></i>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    Available Books
                  </dt>
                  <dd className="text-2xl font-bold text-black">
                    {stats.availableBooks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="modern-card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                  <i className="bx bx-book text-lg text-white"></i>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-600 mb-1">
                    My Borrowed Books
                  </dt>
                  <dd className="text-2xl font-bold text-black">
                    {stats.myBorrowedBooks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/books"
            className="modern-card p-6 text-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-800 transition-colors">
              <i className="bx bx-search text-lg text-white"></i>
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Browse Books</h3>
            <p className="text-sm text-gray-600">Search and discover books</p>
          </Link>

          <Link
            to="/my-books"
            className="modern-card p-6 text-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-700 transition-colors">
              <i className="bx bx-book text-lg text-white"></i>
            </div>
            <h3 className="text-lg font-bold text-black mb-2">My Books</h3>
            <p className="text-sm text-gray-600">View borrowed books</p>
          </Link>

          <Link
            to="/orders"
            className="modern-card p-6 text-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-gray-500 transition-colors">
              <i className="bx bx-shopping-bag text-lg text-white"></i>
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Orders</h3>
            <p className="text-sm text-gray-600">Request new books</p>
          </Link>

          <div className="modern-card p-6 text-center">
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="bx bx-bar-chart text-lg text-white"></i>
            </div>
            <h3 className="text-lg font-bold text-black mb-2">Statistics</h3>
            <p className="text-sm text-gray-600">View library stats</p>
          </div>
        </div>

        {/* Popular Books */}
        {stats.popularBooks.length > 0 && (
          <div className="modern-card p-6">
            <div className="flex items-center mb-4">
              <i className="bx bx-trending-up text-lg text-black mr-3"></i>
              <h3 className="text-xl font-bold text-black">
                Popular Books
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.popularBooks.map((book, index) => (
                <div key={book._id} className="border border-gray-200 rounded-xl p-4 hover:border-black transition-colors group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-black truncate group-hover:text-gray-700">
                        {book.title}
                      </h4>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        by {book.author}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-black ml-3">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <i className="bx bx-bar-chart mr-2"></i>
                    <span>{book.borrowedCount} borrows</span>
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
