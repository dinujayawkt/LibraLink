import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE } from '../config';

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalOrders: 0,
    activeBorrows: 0
  });
  const [loading, setLoading] = useState(true);
  const [borrows, setBorrows] = useState([]);

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
      setBorrows(borrowsData || []);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Derived statistics for charts and quick insights
  const derived = useMemo(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    let todayBorrows = 0;
    let yesterdayBorrows = 0;
    const bookCounts = new Map();
    const categoryCounts = new Map();
    let overdueCount = 0;
    let returnedToday = 0;
    const uniqueBorrowersToday = new Set();

    for (const t of borrows) {
      const created = new Date(t.createdAt || t.borrowedAt);
      if (created >= startOfToday) todayBorrows += 1;
      else if (created >= startOfYesterday && created < startOfToday) yesterdayBorrows += 1;

      const bookId = t.book?._id || t.book?.id;
      if (bookId) {
        const key = `${bookId}::${t.book?.title || 'Unknown'}`;
        bookCounts.set(key, (bookCounts.get(key) || 0) + 1);
      }

      const category = t.book?.category || 'Uncategorized';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);

      const dueAt = new Date(t.dueAt);
      const isReturned = Boolean(t.returnedAt);
      if (!isReturned && dueAt < today) overdueCount += 1;

      if (t.returnedAt) {
        const ret = new Date(t.returnedAt);
        if (ret >= startOfToday) returnedToday += 1;
      }

      if (created >= startOfToday && t.user?._id) {
        uniqueBorrowersToday.add(String(t.user._id));
      }
    }

    const topBooks = Array.from(bookCounts.entries())
      .map(([key, count]) => {
        const [id, title] = key.split('::');
        return { id, title, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topCategories = Array.from(categoryCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      todayBorrows,
      yesterdayBorrows,
      topBooks,
      topCategories,
      overdueCount,
      returnedToday,
      uniqueBorrowersToday: uniqueBorrowersToday.size
    };
  }, [borrows]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white/80 text-lg font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
      <div className="content-wrapper fade-in">
        <div className="mb-8 text-center slide-in-up">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-3">
              <i className="bx bx-cog text-xl text-white"></i>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              <span className="text-gradient">Admin Dashboard</span>
            </h1>
          </div>
          <p className="text-lg text-gray-600">Manage your LibraLink system</p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mt-4"></div>
        </div>

        {/* Borrowing Statistics (top, expanded) */}
        <div className="mt-4 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-black">Borrowing Statistics</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="modern-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Today's Borrows</p>
                  <p className="text-2xl font-black text-black">{derived.todayBorrows}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <i className="bx bx-trending-up text-xl"></i>
                </div>
              </div>
            </div>

            <div className="modern-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Yesterday's Borrows</p>
                  <p className="text-2xl font-black text-black">{derived.yesterdayBorrows}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                  <i className="bx bx-time text-xl"></i>
                </div>
              </div>
            </div>

            <div className="modern-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Overdue Borrows</p>
                  <p className="text-2xl font-black text-black">{derived.overdueCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg">
                  <i className="bx bx-error text-xl"></i>
                </div>
              </div>
            </div>

            <div className="modern-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Returned Today</p>
                  <p className="text-2xl font-black text-black">{derived.returnedToday}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                  <i className="bx bx-check-circle text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="modern-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Unique Borrowers Today</p>
                  <p className="text-2xl font-black text-black">{derived.uniqueBorrowersToday}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                  <i className="bx bx-user text-xl"></i>
                </div>
              </div>
            </div>

            <div className="modern-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Requests (All)</p>
                  <p className="text-2xl font-black text-black">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white shadow-lg">
                  <i className="bx bx-envelope text-xl"></i>
                </div>
              </div>
            </div>

            <div className="modern-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Borrows</p>
                  <p className="text-2xl font-black text-black">{stats.activeBorrows}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <i className="bx bx-book text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Charts: Top Books and Top Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="modern-card p-6">
              <h3 className="text-lg font-bold text-black mb-4">Top Borrowed Books</h3>
              {derived.topBooks.length === 0 ? (
                <p className="text-gray-600">No data available</p>
              ) : (
                <div className="space-y-3">
                  {derived.topBooks.map((item) => {
                    const max = derived.topBooks[0]?.count || 1;
                    const widthPct = Math.max(6, Math.round((item.count / max) * 100));
                    return (
                      <div key={item.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-800 font-medium line-clamp-1 mr-3">{item.title}</span>
                          <span className="text-sm text-gray-600">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200/70 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                            style={{ width: `${widthPct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="modern-card p-6">
              <h3 className="text-lg font-bold text-black mb-4">Top Borrowed Categories</h3>
              {derived.topCategories.length === 0 ? (
                <p className="text-gray-600">No data available</p>
              ) : (
                <div className="space-y-3">
                  {derived.topCategories.map((item) => {
                    const max = derived.topCategories[0]?.count || 1;
                    const widthPct = Math.max(6, Math.round((item.count / max) * 100));
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-800 font-medium line-clamp-1 mr-3">{item.name}</span>
                          <span className="text-sm text-gray-600">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200/70 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                            style={{ width: `${widthPct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Stats (flat colored tiles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Books */}
          <div className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
            <div className="bg-sky-500 text-white p-6 h-36 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-black">{stats.totalBooks}</div>
                <i className="bx bx-book-open text-6xl opacity-20 -mr-2 -mt-2"></i>
              </div>
              <div className="text-white/90">Total Books</div>
            </div>
            <a href="/admin/books" className="block bg-sky-600/90 text-white text-sm px-6 py-2 hover:bg-sky-700/90 transition-colors">
              More info <i className="bx bx-chevron-right align-middle"></i>
            </a>
          </div>

          {/* Total Users */}
          <div className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
            <div className="bg-emerald-600 text-white p-6 h-36 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-black">{stats.totalUsers}</div>
                <i className="bx bx-user text-6xl opacity-20 -mr-2 -mt-2"></i>
              </div>
              <div className="text-white/90">Total Users</div>
            </div>
            <a href="/admin/users" className="block bg-emerald-700/90 text-white text-sm px-6 py-2 hover:bg-emerald-800/90 transition-colors">
              More info <i className="bx bx-chevron-right align-middle"></i>
            </a>
          </div>

          {/* Pending Orders */}
          <div className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
            <div className="bg-cyan-600 text-white p-6 h-36 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-black">{stats.totalOrders}</div>
                <i className="bx bx-shopping-bag text-6xl opacity-20 -mr-2 -mt-2"></i>
              </div>
              <div className="text-white/90">Pending Orders</div>
            </div>
            <a href="/admin/orders" className="block bg-cyan-700/90 text-white text-sm px-6 py-2 hover:bg-cyan-800/90 transition-colors">
              More info <i className="bx bx-chevron-right align-middle"></i>
            </a>
          </div>

          {/* Active Borrows */}
          <div className="relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
            <div className="bg-orange-500 text-white p-6 h-36 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="text-3xl font-black">{stats.activeBorrows}</div>
                <i className="bx bx-book text-6xl opacity-20 -mr-2 -mt-2"></i>
              </div>
              <div className="text-white/90">Active Borrows</div>
            </div>
            <a href="/admin/borrows" className="block bg-orange-600/90 text-white text-sm px-6 py-2 hover:bg-orange-700/90 transition-colors">
              More info <i className="bx bx-chevron-right align-middle"></i>
            </a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-black">Quick Actions</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <a
            href="/admin/books"
            className="modern-card p-8 text-center group hover:scale-110 transition-all duration-500 "
          >
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <i className="bx bx-library text-2xl text-white drop-shadow"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gradient transition-all duration-300">Manage Books</h3>
            <p className="text-gray-600 group-hover:text-black transition-colors duration-300">Add, edit, delete books</p>
          </a>

          <a
            href="/admin/users"
            className="modern-card p-8 text-center group hover:scale-110 transition-all duration-500 "
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-lime-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <i className="bx bx-group text-2xl text-white drop-shadow"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gradient transition-all duration-300">Manage Users</h3>
            <p className="text-gray-600 group-hover:text-black transition-colors duration-300">View and manage users</p>
          </a>

          <a
            href="/admin/orders"
            className="modern-card p-8 text-center group hover:scale-110 transition-all duration-500 "
          >
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <i className="bx bx-shopping-bag text-2xl text-white drop-shadow"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gradient transition-all duration-300">Manage Orders</h3>
            <p className="text-gray-600 group-hover:text-black transition-colors duration-300">Approve book requests</p>
          </a>

          <a
            href="/admin/borrows"
            className="modern-card p-8 text-center group hover:scale-110 transition-all duration-500 "
          >
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <i className="bx bx-book text-2xl text-white drop-shadow"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gradient transition-all duration-300">Borrow History</h3>
            <p className="text-gray-600 group-hover:text-black transition-colors duration-300">View all borrows</p>
          </a>
        </div>

        {/* Borrowing Statistics */}
        {/* Removed duplicate bottom section now that it's at the top */}
        </div>
      </div>
  );
}

export default AdminDashboard;
