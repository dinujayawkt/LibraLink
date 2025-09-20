import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4000/api';

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalOrders: 0,
    activeBorrows: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const [booksResponse, usersResponse, ordersResponse, borrowsResponse] = await Promise.all([
        fetch(`${API_BASE}/books?limit=1`),
        fetch(`${API_BASE}/admin/users`, { credentials: 'include' }),
        fetch(`${API_BASE}/orders`, { credentials: 'include' }),
        fetch(`${API_BASE}/admin/borrows`, { credentials: 'include' })
      ]);

      const booksData = await booksResponse.json();
      const usersData = await usersResponse.json();
      const ordersData = await ordersResponse.json();
      const borrowsData = await borrowsResponse.json();

      setStats({
        totalBooks: booksData.total || 0,
        totalUsers: usersData.length || 0,
        totalOrders: ordersData.length || 0,
        activeBorrows: borrowsData.filter(b => b.status === 'borrowed').length || 0
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
      <div className="content-wrapper">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <i className="bx bx-cog text-3xl text-black mr-3"></i>
            <h1 className="text-4xl font-bold text-black">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Manage your LibraLink system
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="modern-card p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center">
                  <i className="bx bx-library text-2xl text-white"></i>
                </div>
              </div>
              <div className="ml-6 flex-1">
                <dl>
                  <dt className="text-base font-medium text-gray-600 mb-1">
                    Total Books
                  </dt>
                  <dd className="text-3xl font-bold text-black">
                    {stats.totalBooks}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="modern-card p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center">
                  <i className="bx bx-group text-2xl text-white"></i>
                </div>
              </div>
              <div className="ml-6 flex-1">
                <dl>
                  <dt className="text-base font-medium text-gray-600 mb-1">
                    Total Users
                  </dt>
                  <dd className="text-3xl font-bold text-black">
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="modern-card p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-600 rounded-xl flex items-center justify-center">
                  <i className="bx bx-shopping-bag text-2xl text-white"></i>
                </div>
              </div>
              <div className="ml-6 flex-1">
                <dl>
                  <dt className="text-base font-medium text-gray-600 mb-1">
                    Pending Orders
                  </dt>
                  <dd className="text-3xl font-bold text-black">
                    {stats.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="modern-card p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-500 rounded-xl flex items-center justify-center">
                  <i className="bx bx-book text-2xl text-white"></i>
                </div>
              </div>
              <div className="ml-6 flex-1">
                <dl>
                  <dt className="text-base font-medium text-gray-600 mb-1">
                    Active Borrows
                  </dt>
                  <dd className="text-3xl font-bold text-black">
                    {stats.activeBorrows}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <a
            href="/admin/books"
            className="modern-card p-8 text-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-800 transition-colors">
              <i className="bx bx-library text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Manage Books</h3>
            <p className="text-gray-600">Add, edit, delete books</p>
          </a>

          <a
            href="/admin/users"
            className="modern-card p-8 text-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-700 transition-colors">
              <i className="bx bx-group text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Manage Users</h3>
            <p className="text-gray-600">View and manage users</p>
          </a>

          <a
            href="/admin/orders"
            className="modern-card p-8 text-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-500 transition-colors">
              <i className="bx bx-shopping-bag text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Manage Orders</h3>
            <p className="text-gray-600">Approve book requests</p>
          </a>

          <a
            href="/admin/borrows"
            className="modern-card p-8 text-center group hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 bg-gray-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-400 transition-colors">
              <i className="bx bx-book text-2xl text-white"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Borrow History</h3>
            <p className="text-gray-600">View all borrows</p>
          </a>
        </div>
        </div>
      </div>
  );
}

export default AdminDashboard;
