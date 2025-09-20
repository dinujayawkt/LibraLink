import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4000/api';

function AdminUsers({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/users`, {
        credentials: 'include'
      });
      const data = await response.json();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('User deleted successfully!');
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleToggleBlock = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ blocked: !currentStatus })
      });

      if (response.ok) {
        alert(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully!`);
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update user status');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'assistant': return 'bg-yellow-100 text-yellow-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="flex items-center mb-2">
            <i className="bx bx-user text-3xl text-black mr-3"></i>
            <h1 className="text-4xl font-bold text-black">Manage Users</h1>
          </div>
          <p className="text-lg text-gray-600">View and manage all LibraLink users</p>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div key={user._id} className="modern-card p-6 group hover:scale-105 transition-transform duration-200">
              <div className="flex items-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  user.role === 'admin' ? 'bg-red-600' :
                  user.role === 'assistant' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-bold text-black">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold">Role:</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    user.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Joined:</span>
                  <span className="text-gray-800">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleToggleBlock(user._id, user.blocked)}
                  className={`flex-1 modern-btn flex items-center justify-center space-x-2 ${
                    user.blocked ? 'bg-green-600 text-white hover:bg-green-700' : 'modern-btn-secondary'
                  }`}
                >
                  <i className={`bx ${user.blocked ? 'bx-check' : 'bx-block'} text-lg`}></i>
                  <span>{user.blocked ? 'Unblock' : 'Block'}</span>
                </button>
                <button
                  onClick={() => handleDeleteUser(user._id)}
                  className="flex-1 modern-btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center space-x-2"
                >
                  <i className="bx bx-trash text-lg"></i>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="modern-card p-6 text-center">
            <div className="text-3xl font-bold text-black mb-2">{users.length}</div>
            <div className="text-lg text-gray-600">Total Users</div>
          </div>
          <div className="modern-card p-6 text-center">
            <div className="text-3xl font-bold text-black mb-2">
              {users.filter(u => u.role === 'member').length}
            </div>
            <div className="text-lg text-gray-600">Members</div>
          </div>
          <div className="modern-card p-6 text-center">
            <div className="text-3xl font-bold text-black mb-2">
              {users.filter(u => u.blocked).length}
            </div>
            <div className="text-lg text-gray-600">Blocked Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
