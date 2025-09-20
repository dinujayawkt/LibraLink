import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:4000/api';

function Community({ user }) {
  const [communities, setCommunities] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [joining, setJoining] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: '',
    maxMembers: 100,
    rules: []
  });

  useEffect(() => {
    fetchCommunities();
    fetchMyCommunities();
  }, [activeTab, searchTerm, selectedCategory, currentPage]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`${API_BASE}/communities?${params}`);
      const data = await response.json();
      setCommunities(data.communities || []);
      setTotalPages(Math.ceil(data.total / 12));
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCommunities = async () => {
    try {
      const response = await fetch(`${API_BASE}/communities/my`, {
        credentials: 'include'
      });
      const data = await response.json();
      setMyCommunities(data || []);
    } catch (error) {
      console.error('Failed to fetch my communities:', error);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    if (joining[communityId]) return;

    setJoining(prev => ({ ...prev, [communityId]: true }));

    try {
      const response = await fetch(`${API_BASE}/communities/${communityId}/join`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Successfully joined the community!');
        fetchCommunities();
        fetchMyCommunities();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to join community');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setJoining(prev => ({ ...prev, [communityId]: false }));
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (creating) return;

    setCreating(true);
    try {
      const response = await fetch(`${API_BASE}/communities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newCommunity)
      });

      if (response.ok) {
        alert('Community created successfully!');
        setShowCreateForm(false);
        setNewCommunity({
          name: '',
          description: '',
          category: '',
          maxMembers: 100,
          rules: []
        });
        fetchCommunities();
        fetchMyCommunities();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to create community');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCommunities();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const categories = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 
    'Romance', 'Thriller', 'Biography', 'History', 'Science', 'Technology',
    'Philosophy', 'Art', 'Music', 'Travel', 'Cooking', 'Health', 'Other'
  ];

  if (loading && activeTab === 'all') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="content-wrapper">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-black mb-2">Book Communities</h1>
              <p className="text-xs sm:text-sm text-gray-600">Join communities to discuss books with fellow readers</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="modern-btn modern-btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <i className="bx bx-plus text-lg"></i>
              <span>Create Community</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            All Communities
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            My Communities ({myCommunities.length})
          </button>
        </div>

        {/* Search and Filters - Only show for "all" tab */}
        {activeTab === 'all' && (
          <div className="modern-card p-4 sm:p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-semibold text-black mb-1">
                    Search Communities
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or description..."
                    className="modern-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="modern-input"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end space-x-2">
                  <button
                    type="submit"
                    className="flex-1 modern-btn modern-btn-primary flex items-center justify-center space-x-2 text-sm"
                  >
                    <i className="bx bx-search text-lg"></i>
                    <span>Search</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="modern-btn modern-btn-secondary flex items-center justify-center space-x-2 text-sm"
                  >
                    <i className="bx bx-x text-lg"></i>
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Communities Grid */}
        {activeTab === 'all' ? (
          communities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-group text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No communities found</h3>
              <p className="text-sm text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {communities.map((community) => (
                <div key={community._id} className="modern-card p-4 sm:p-6 group hover:scale-105 transition-transform duration-200">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-black mb-2 line-clamp-2">
                        {community.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-3">
                        {community.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2 text-xs text-gray-600 mb-3 sm:mb-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Category:</span>
                      <span className="text-gray-800">{community.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Members:</span>
                      <span className="text-gray-800">{community.memberCount}/{community.maxMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Created:</span>
                      <span className="text-gray-800">{new Date(community.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full w-fit">
                      {community.category}
                    </span>
                    
                    {community.members.some(member => String(member._id) === user.id) ? (
                      <Link
                        to={`/community/${community._id}`}
                        className="modern-btn modern-btn-primary flex items-center justify-center space-x-2 text-sm w-full sm:w-auto"
                      >
                        <i className="bx bx-message text-lg"></i>
                        <span>Enter</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleJoinCommunity(community._id)}
                        disabled={joining[community._id] || community.isFull}
                        className="modern-btn modern-btn-secondary flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        <i className="bx bx-plus text-lg"></i>
                        <span>{joining[community._id] ? 'Joining...' : community.isFull ? 'Full' : 'Join'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // My Communities
          myCommunities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-group text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No communities yet</h3>
              <p className="text-sm text-gray-600">Join some communities to start discussing books!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCommunities.map((community) => (
                <div key={community._id} className="modern-card p-6 group hover:scale-105 transition-transform duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">
                        {community.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {community.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Category:</span>
                      <span className="text-gray-800">{community.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Members:</span>
                      <span className="text-gray-800">{community.memberCount}/{community.maxMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Role:</span>
                      <span className="text-gray-800">
                        {String(community.createdBy._id) === user.id ? 'Creator' : 
                         community.moderators.some(mod => String(mod._id) === user.id) ? 'Moderator' : 'Member'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {community.category}
                    </span>
                    
                    <Link
                      to={`/community/${community._id}`}
                      className="modern-btn modern-btn-primary flex items-center space-x-2 text-sm"
                    >
                      <i className="bx bx-message text-lg"></i>
                      <span>Enter</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Pagination - Only for "all" tab */}
        {activeTab === 'all' && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="modern-btn modern-btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="bx bx-chevron-left text-lg"></i>
                <span>Previous</span>
              </button>
              
              <span className="px-4 py-2 text-sm font-semibold text-black">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="modern-btn modern-btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <i className="bx bx-chevron-right text-lg"></i>
              </button>
            </div>
          </div>
        )}

        {/* Create Community Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-black">Create New Community</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-600 hover:text-black text-2xl"
                  >
                    <i className="bx bx-x"></i>
                  </button>
                </div>

                <form onSubmit={handleCreateCommunity} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Community Name *
                    </label>
                    <input
                      type="text"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                      placeholder="Enter community name..."
                      className="modern-input"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                      placeholder="Describe what this community is about..."
                      className="modern-input h-24 resize-none"
                      maxLength={500}
                      required
                    />
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {newCommunity.description.length}/500
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Category *
                    </label>
                    <select
                      value={newCommunity.category}
                      onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                      className="modern-input"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Maximum Members
                    </label>
                    <input
                      type="number"
                      value={newCommunity.maxMembers}
                      onChange={(e) => setNewCommunity({ ...newCommunity, maxMembers: parseInt(e.target.value) || 100 })}
                      placeholder="100"
                      className="modern-input"
                      min="10"
                      max="1000"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 modern-btn modern-btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <i className="bx bx-plus text-lg"></i>
                      <span>{creating ? 'Creating...' : 'Create Community'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="modern-btn modern-btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;
