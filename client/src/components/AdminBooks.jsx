import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import { API_BASE } from '../config';

function AdminBooks({ user }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    coverUrl: '',
    totalCopies: 1,
    locationCode: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/books?limit=100`);
      const data = await response.json();
      setBooks(data.items || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingBook 
        ? `${API_BASE}/books/${editingBook._id}`
        : `${API_BASE}/books`;
      
      const method = editingBook ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingBook ? 'Book updated successfully!' : 'Book added successfully!');
        setFormData({ title: '', author: '', isbn: '', category: '', coverUrl: '', totalCopies: 1, locationCode: '' });
        setShowAddForm(false);
        setEditingBook(null);
        fetchBooks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      category: book.category || '',
      coverUrl: book.coverUrl || '',
      totalCopies: book.totalCopies,
      locationCode: book.locationCode || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/books/${bookId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Book deleted successfully!');
        fetchBooks();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete book');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingBook(null);
    setFormData({ title: '', author: '', isbn: '', category: '', coverUrl: '', totalCopies: 1, locationCode: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white/80 text-lg font-medium">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="content-wrapper fade-in">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-3">
                <i className="bx bx-library text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black"><span className="text-gradient">Manage Books</span></h1>
                <p className="mt-1 text-sm text-gray-700">Add, edit, and delete books in LibraLink</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="modern-btn modern-btn-primary"
            >
              + Add New Book
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-200 shadow-lg slide-in-up">
            <h2 className="text-lg font-semibold text-black mb-3">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="modern-input"
                  placeholder="Enter book title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="modern-input"
                  placeholder="Enter author name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="modern-input"
                  placeholder="Enter ISBN"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="modern-input"
                  placeholder="Enter category"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                  className="modern-input"
                  placeholder="Paste image URL (e.g., https://...)"
                />
                {formData.coverUrl && (
                  <div className="mt-2 flex items-center space-x-3">
                    <div className="w-12 h-16 rounded overflow-hidden border border-gray-200 shadow-sm">
                      <img src={formData.coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-gray-600 truncate">Preview</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Total Copies *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.totalCopies}
                  onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                  className="modern-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Location Code
                </label>
                <input
                  type="text"
                  value={formData.locationCode}
                  onChange={(e) => setFormData({ ...formData, locationCode: e.target.value })}
                  className="modern-input"
                  placeholder="Enter location code"
                />
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="modern-btn modern-btn-secondary flex items-center space-x-2"
                >
                  <i className="bx bx-x text-lg"></i>
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="modern-btn modern-btn-primary flex items-center space-x-2"
                >
                  <i className="bx bx-check text-lg"></i>
                  <span>{editingBook ? 'Update Book' : 'Add Book'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Books List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden border border-gray-200 slide-in-up">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Book Details
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Copies
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Available
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map((book) => (
                <tr key={book._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-black truncate max-w-xs">{book.title}</div>
                      <div className="text-xs text-gray-600 truncate max-w-xs">by {book.author}</div>
                      {book.category && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">{book.category}</div>
                      )}
                      {book.isbn && (
                        <div className="text-xs text-gray-400">ISBN: {book.isbn}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-black">
                    {book.totalCopies}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-black">
                    {book.totalCopies - book.borrowedCount}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(book)}
                      className="text-black hover:text-gray-600 text-xs font-medium px-2 py-1 rounded hover:bg-gray-100 transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminBooks;
