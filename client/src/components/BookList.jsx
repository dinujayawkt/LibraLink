import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import BookDetailsPopup from './BookDetailsPopup';
import BookReviewsPopup from './BookReviewsPopup';
import { API_BASE } from '../config';

function BookList({ user }) {
  const [books, setBooks] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedCategory, setAppliedCategory] = useState('');
  const [appliedAuthor, setAppliedAuthor] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [borrowing, setBorrowing] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchBooks();
    loadWishlist();
  }, [appliedSearchTerm, appliedCategory, appliedAuthor, sortBy, sortOrder, currentPage]);

  // Reload wishlist when the logged-in user changes
  useEffect(() => {
    loadWishlist();
  }, [user?._id]);

  const loadWishlist = () => {
    try {
      // Use per-user wishlist key. Fall back to clearing legacy key if present.
      const userKey = user?._id || user?.email || 'guest';
      const key = `wishlist:${userKey}`;

      // Migrate/clear legacy global wishlist to avoid leakage across accounts
      if (localStorage.getItem('wishlist')) {
        localStorage.removeItem('wishlist');
      }

      const savedWishlist = localStorage.getItem(key);
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    } catch (e) {
      console.error('Failed to load wishlist from storage', e);
      setWishlist([]);
    }
  };

  const addToWishlist = (book) => {
    const updatedWishlist = [...wishlist, book];
    setWishlist(updatedWishlist);
    const userKey = user?._id || user?.email || 'guest';
    localStorage.setItem(`wishlist:${userKey}`, JSON.stringify(updatedWishlist));
  };

  const removeFromWishlist = (bookId) => {
    const updatedWishlist = wishlist.filter(book => book._id !== bookId);
    setWishlist(updatedWishlist);
    const userKey = user?._id || user?.email || 'guest';
    localStorage.setItem(`wishlist:${userKey}`, JSON.stringify(updatedWishlist));
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
      setIsFetching(true);
      const params = new URLSearchParams({
        q: appliedSearchTerm,
        category: appliedCategory,
        author: appliedAuthor,
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
      setIsFetching(false);
      setInitialLoad(false);
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
        toast.success('Book borrowed successfully!');
        fetchBooks(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to borrow book');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setBorrowing(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setAppliedSearchTerm(searchTerm);
    setAppliedCategory(category);
    setAppliedAuthor(author);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setAuthor('');
    setAppliedSearchTerm('');
    setAppliedCategory('');
    setAppliedAuthor('');
    setCurrentPage(1);
  };

  // Removed full-page loading return to prevent the entire search box from reloading

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
      <div className="content-wrapper fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-3 slide-in-up">
            Explore Our <span className="text-gradient">Library</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 slide-in-up" style={{animationDelay: '0.2s'}}>
            Discover thousands of books waiting to be explored
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mx-auto mt-6 slide-in-up" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Search and Filters */}
        <div className="modern-card p-5 md:p-6 mb-6 slide-in-up" style={{animationDelay: '0.6s'}}>
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-bold text-black mb-1">Find Your Next Read</h2>
            <p className="text-sm text-gray-600">Search through our extensive collection</p>
          </div>
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm md:text-base font-semibold text-black mb-2">
                  <i className="bx bx-search mr-2"></i>Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, author, or ISBN..."
                    className="modern-input h-10 md:h-11 pl-10 md:pl-12 text-sm"
                  />
                  <i className="bx bx-search absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base md:text-lg"></i>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm md:text-base font-semibold text-black mb-2">
                  <i className="bx bx-category mr-2"></i>Category
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Fiction, Science"
                    className="modern-input h-10 md:h-11 pl-10 md:pl-12 text-sm"
                  />
                  <i className="bx bx-category absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base md:text-lg"></i>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm md:text-base font-semibold text-black mb-2">
                  <i className="bx bx-user mr-2"></i>Author
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    className="modern-input h-10 md:h-11 pl-10 md:pl-12 text-sm"
                  />
                  <i className="bx bx-user absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base md:text-lg"></i>
                </div>
              </div>
              
              <div className="flex items-end space-x-2 md:space-x-3">
                <button
                  type="submit"
                  className="flex-1 modern-btn modern-btn-primary h-10 md:h-11 text-sm flex items-center justify-center space-x-2 group"
                >
                  <i className="bx bx-search text-base md:text-lg group-hover:scale-110 transition-transform duration-300"></i>
                  <span>Search</span>
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="modern-btn modern-btn-secondary h-10 md:h-11 text-sm flex items-center justify-center space-x-2 group"
                >
                  <i className="bx bx-x text-base md:text-lg group-hover:scale-110 transition-transform duration-300"></i>
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </form>

          {/* Sort Options */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm md:text-base font-semibold text-black flex items-center whitespace-nowrap">
                <i className="bx bx-sort-alt-2 mr-2"></i>Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="modern-input h-10 md:h-11 text-sm px-3 md:px-4 min-w-[140px]"
              >
                <option value="createdAt">Date Added</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="borrowedCount">Popularity</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm md:text-base font-semibold text-black flex items-center">
                <i className="bx bx-sort mr-2"></i>Order:
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="modern-input h-10 md:h-11 text-sm px-3 md:px-4 min-w-[140px]"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {initialLoad ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="loading-spinner"></div>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Discovering Books</h3>
            <p className="text-sm text-gray-600">Loading our amazing collection...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bx bx-book text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No books found</h3>
            <p className="text-sm text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="relative">
            {isFetching && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                <div className="loading-spinner"></div>
              </div>
            )}
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
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center slide-in-up" style={{animationDelay: '1s'}}>
            <div className="modern-card p-6">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="modern-btn modern-btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <i className="bx bx-chevron-left text-lg group-hover:scale-110 transition-transform duration-300"></i>
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="px-6 py-3 text-lg font-bold text-black bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="modern-btn modern-btn-secondary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span>Next</span>
                  <i className="bx bx-chevron-right text-lg group-hover:scale-110 transition-transform duration-300"></i>
                </button>
              </div>
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



