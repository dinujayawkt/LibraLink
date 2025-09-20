import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:4000/api';

function BookReviewsPopup({ book, isOpen, onClose, canWriteReview = false }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && book) {
      fetchReviews();
      fetchStats();
    }
  }, [isOpen, book, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/reviews/book/${book._id}?page=${currentPage}&limit=5`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalPages(Math.ceil(data.total / 5));
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/reviews/book/${book._id}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      console.log('Submitting review:', { bookId: book._id, ...newReview });
      console.log('API URL:', `${API_BASE}/reviews`);
      
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookId: book._id,
          ...newReview
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        setShowWriteReview(false);
        setNewReview({ rating: 5, title: '', content: '' });
        fetchReviews();
        fetchStats();
        alert('Review submitted successfully!');
      } else {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        alert(errorData.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Network error: ${error.message}. Please check if the server is running.`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onChange = null) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            className={`text-2xl ${
              star <= rating 
                ? 'text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Book Reviews</h2>
            <h3 className="text-sm sm:text-lg text-gray-300 truncate">{book.title}</h3>
            <p className="text-xs sm:text-sm text-gray-400">by {book.author}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-xl sm:text-2xl ml-2 flex-shrink-0"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          {/* Write Review Button - Always show when user can write review */}
          {canWriteReview && (
            <div className="modern-card p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h3 className="text-lg sm:text-xl font-bold text-black">Write a Review</h3>
                <button
                  onClick={() => setShowWriteReview(!showWriteReview)}
                  className="modern-btn modern-btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                  <i className="bx bx-edit text-lg"></i>
                  <span>{showWriteReview ? 'Cancel' : 'Write Review'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Review Stats */}
          {stats && (
            <div className="modern-card p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-black">Overall Rating</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-black">{stats.averageRating}</div>
                  {renderStars(Math.round(stats.averageRating))}
                  <div className="text-xs sm:text-sm text-gray-600">{stats.totalReviews} reviews</div>
                </div>
                
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                      <span className="text-xs sm:text-sm w-6 sm:w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ 
                            width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8">
                        {stats.ratingDistribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Write Review Form */}
          {showWriteReview && (
            <div className="modern-card p-6 mb-6">
              <h3 className="text-xl font-bold text-black mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Rating
                  </label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview({ ...newReview, rating })
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    placeholder="Give your review a title..."
                    className="modern-input"
                    maxLength={100}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    placeholder="Share your thoughts about this book..."
                    className="modern-input h-32 resize-none"
                    maxLength={1000}
                    required
                  />
                  <div className="text-xs text-gray-500 text-right mt-1">
                    {newReview.content.length}/1000
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="modern-btn modern-btn-primary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <i className="bx bx-send text-lg"></i>
                    <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWriteReview(false)}
                    className="modern-btn modern-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-black">Reviews</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 modern-card">
                <i className="bx bx-message-square-dots text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">
                  {canWriteReview 
                    ? "No reviews yet. Be the first to review this book!" 
                    : "No reviews yet for this book."
                  }
                </p>
                {canWriteReview && (
                  <p className="text-sm text-gray-500 mt-2">
                    Click "Write Review" above to share your thoughts!
                  </p>
                )}
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="modern-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-black">{review.user.name}</h4>
                        <div className="flex items-center space-x-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {review.helpfulCount} helpful
                      </div>
                    </div>
                  </div>
                  
                  <h5 className="font-bold text-black mb-2">{review.title}</h5>
                  <p className="text-gray-700 leading-relaxed">{review.content}</p>
                  
                  {review.isEdited && (
                    <div className="text-xs text-gray-500 mt-2">
                      Edited on {new Date(review.editedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="modern-btn modern-btn-secondary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <i className="bx bx-chevron-left"></i>
                    <span>Previous</span>
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-semibold text-black">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="modern-btn modern-btn-secondary flex items-center space-x-2 disabled:opacity-50"
                  >
                    <span>Next</span>
                    <i className="bx bx-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookReviewsPopup;
