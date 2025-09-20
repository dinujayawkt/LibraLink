import React, { useState, useEffect } from 'react';
import BookDetailsPopup from './BookDetailsPopup';
import BookReviewsPopup from './BookReviewsPopup';

const API_BASE = 'http://localhost:4000/api';

function BookList({ user }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [borrowing, setBorrowing] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchBooks();
    loadWishlist();
  }, [searchTerm, category, author, sortBy, sortOrder, currentPage]);

  const loadWishlist = () => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  };

  const addToWishlist = (book) => {
    const updatedWishlist = [...wishlist, book];
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const removeFromWishlist = (bookId) => {
    const updatedWishlist = wishlist.filter(book => book._id !== bookId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const isInWishlist = (bookId) => {
    return wishlist.some(book => book._id === bookId);
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedBook(null);
  };

  const handleViewReviews = (book) => {
    setSelectedBook(book);
    setShowReviewsPopup(true);
  };

  const handleCloseReviewsPopup = () => {
    setShowReviewsPopup(false);
    setSelectedBook(null);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: searchTerm,
        category,
        author,
        sort: sortBy,
        order: sortOrder,
        page: currentPage,
        limit: 12
      });

      const response = await fetch(`${API_BASE}/books?${params}`);
      const data = await response.json();
      
      setBooks(data.items || []);
      setTotalPages(Math.ceil(data.total / 12));
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    if (borrowing[bookId]) return;

    setBorrowing(prev => ({ ...prev, [bookId]: true }));

    try {
      const formData = new FormData();
      // For now, we'll skip photo upload - you can add a file input later
      
      const response = await fetch(`${API_BASE}/borrow/borrow/${bookId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        alert('Book borrowed successfully!');
        fetchBooks(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to borrow book');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setBorrowing(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setAuthor('');
    setCurrentPage(1);
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
          <h1 className="text-2xl font-bold text-black mb-2">Browse Books</h1>
          <p className="text-sm text-gray-600">Search and discover books in LibraLink</p>
        </div>

        {/* Search and Filters */}
        <div className="modern-card p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, author, or ISBN..."
                  className="modern-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Fiction, Science"
                  className="modern-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author name"
                  className="modern-input"
                />
              </div>
              
              <div className="flex items-end space-x-3">
                <button
                  type="submit"
                  className="flex-1 modern-btn modern-btn-primary flex items-center justify-center space-x-2"
                >
                  <i className="bx bx-search text-lg"></i>
                  <span>Search</span>
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="modern-btn modern-btn-secondary flex items-center justify-center space-x-2"
                >
                  <i className="bx bx-x text-lg"></i>
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </form>

          {/* Sort Options */}
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-black">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="modern-input py-2"
              >
                <option value="createdAt">Date Added</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="borrowedCount">Popularity</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-sm font-semibold text-black">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="modern-input py-2"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bx bx-book text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No books found</h3>
            <p className="text-sm text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book._id} className="modern-card p-4 group hover:scale-105 transition-transform duration-200">
                <div className="text-center mb-6">
                  {/* Book Cover Image */}
                  <div className="w-24 h-36 mx-auto mb-3 rounded-lg overflow-hidden shadow-lg">
                    {book.coverUrl ? (
                      <img 
                        src={book.coverUrl} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <i className="bx bx-book text-2xl text-white"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Icons */}
                  <div className="flex justify-center space-x-2 mb-3">
                    <button 
                      onClick={() => isInWishlist(book._id) ? removeFromWishlist(book._id) : addToWishlist(book)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isInWishlist(book._id) 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-red-100 hover:bg-red-200'
                      }`}
                      title={isInWishlist(book._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <i className={`bx ${isInWishlist(book._id) ? 'bxs-heart' : 'bx-heart'} text-sm ${
                        isInWishlist(book._id) ? 'text-white' : 'text-red-600'
                      }`}></i>
                    </button>
                    <button 
                      onClick={() => handleViewDetails(book)}
                      className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
                      title="View Details"
                    >
                      <i className="bx bx-show text-blue-600 text-sm"></i>
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-black line-clamp-2 mb-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    by {book.author}
                  </p>
                  {book.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                      {book.category}
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-gray-600 mb-4">
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
                  <div className="flex justify-between">
                    <span className="font-semibold">Borrowed:</span> 
                    <span className="text-gray-800">{book.borrowedCount}</span>
                  </div>
                </div>

                <div className="mt-6">
                  {book.totalCopies - book.borrowedCount > 0 ? (
                    <button
                      onClick={() => handleBorrow(book._id)}
                      disabled={borrowing[book._id]}
                      className="w-full modern-btn modern-btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="bx bx-plus text-lg"></i>
                      <span>{borrowing[book._id] ? 'Borrowing...' : 'Borrow Book'}</span>
                    </button>
                  ) : (
                    <div className="w-full bg-gray-200 text-gray-600 py-2 px-3 rounded-lg text-center text-sm font-semibold">
                      Not Available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
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
      </div>
      
      {/* Book Details Popup */}
      <BookDetailsPopup 
        book={selectedBook}
        isOpen={showPopup}
        onClose={handleClosePopup}
        onViewReviews={handleViewReviews}
      />
      
      {/* Book Reviews Popup */}
      <BookReviewsPopup 
        book={selectedBook}
        isOpen={showReviewsPopup}
        onClose={handleCloseReviewsPopup}
        canWriteReview={false}
      />
    </div>
  );
}

export default BookList;
