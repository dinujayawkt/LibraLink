import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';
import BookReviewsPopup from './BookReviewsPopup';
import { API_BASE } from '../config';

function MyBooks({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState({});
  const [returning, setReturning] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/borrow/my`, {
        credentials: 'include'
      });
      const data = await response.json();
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to fetch my books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async (transactionId, days = 7) => {
    if (extending[transactionId]) return;

    setExtending(prev => ({ ...prev, [transactionId]: true }));

    try {
      const response = await fetch(`${API_BASE}/borrow/extend/${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ days, reason: 'User requested extension' })
      });

      if (response.ok) {
        let updatedTx = null;
        try {
          updatedTx = await response.json();
        } catch (_) {}
        // Update only this transaction locally (fallback: add days optimistically)
        setTransactions(prev => prev.map(tx => {
          if (tx._id !== transactionId) return tx;
          if (updatedTx && updatedTx._id) return updatedTx;
          const prevDue = new Date(tx.dueAt);
          const newDue = new Date(prevDue.getTime());
          newDue.setDate(newDue.getDate() + days);
          return {
            ...tx,
            dueAt: newDue.toISOString(),
            extensions: Array.isArray(tx.extensions) ? [...tx.extensions, { days, at: new Date().toISOString() }] : [{ days, at: new Date().toISOString() }]
          };
        }));
        toast.success('Book return date extended successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to extend book');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setExtending(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  

  const handleReturn = async (transactionId) => {
    if (returning[transactionId]) return;

    setReturning(prev => ({ ...prev, [transactionId]: true }));

    try {
      const formData = new FormData();
      // For now, we'll skip photo upload - you can add a file input later
      
      const response = await fetch(`${API_BASE}/borrow/return/${transactionId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        let updatedTx = null;
        try {
          updatedTx = await response.json();
        } catch (_) {}
        setTransactions(prev => prev.map(tx => {
          if (tx._id !== transactionId) return tx;
          if (updatedTx && updatedTx._id) return updatedTx;
          return {
            ...tx,
            status: 'returned',
            returnedAt: new Date().toISOString()
          };
        }));
        toast.success('Book returned successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to return book');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setReturning(prev => ({ ...prev, [transactionId]: false }));
    }
  };

  const getStatusColor = (status, dueAt) => {
    if (status === 'returned') return 'bg-green-100 text-green-800';
    if (status === 'overdue') return 'bg-red-100 text-red-800';
    
    const now = new Date();
    const due = new Date(dueAt);
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) return 'bg-red-100 text-red-800';
    if (daysUntilDue <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (status, dueAt) => {
    if (status === 'returned') return 'Returned';
    if (status === 'overdue') return 'Overdue';
    
    const now = new Date();
    const due = new Date(dueAt);
    const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) return 'Overdue';
    if (daysUntilDue === 1) return 'Due tomorrow';
    if (daysUntilDue <= 3) return `Due in ${daysUntilDue} days`;
    return `Due in ${daysUntilDue} days`;
  };

  const handleViewReviews = (book) => {
    setSelectedBook(book);
    setShowReviewsPopup(true);
  };

  const handleCloseReviewsPopup = () => {
    setShowReviewsPopup(false);
    setSelectedBook(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeBooks = transactions.filter(t => t.status === 'borrowed');
  const returnedBooks = transactions.filter(t => t.status === 'returned');

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8 ">
      <div className="content-wrapper">
        <div className="mb-5">
          <h1 className="text-lg md:text-xl font-bold text-black mb-1">My Books</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your borrowed books and view history</p>
        </div>

        {/* Active Books */}
        <div className="mb-12">
          <div className="flex items-center mb-3">
            <i className="bx bx-book text-base md:text-lg text-black mr-3"></i>
            <h2 className="text-base md:text-lg font-bold text-black">
              Currently Borrowed ({activeBooks.length})
            </h2>
          </div>
          
          {activeBooks.length === 0 ? (
            <div className="text-center py-16 modern-card">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-book text-4xl text-gray-400"></i>
              </div>
              <p className="text-sm text-gray-600">You haven't borrowed any books yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeBooks.map((transaction) => (
                <div key={transaction._id} className="modern-card p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-black line-clamp-2 mb-1">
                        {transaction.book?.title || 'Unknown Book'}
                      </h3>
                      <p className="text-gray-600">
                        by {transaction.book?.author || 'Unknown Author'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full font-semibold ${getStatusColor(transaction.status, transaction.dueAt)}`}>
                      {getStatusText(transaction.status, transaction.dueAt)}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex justify-between">
                      <span className="font-semibold">Borrowed:</span> 
                      <span className="text-gray-800">{new Date(transaction.borrowedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Due:</span> 
                      <span className="text-gray-800">{new Date(transaction.dueAt).toLocaleDateString()}</span>
                    </div>
                    {transaction.extensions && transaction.extensions.length > 0 && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Extensions:</span> 
                        <span className="text-gray-800">{transaction.extensions.length}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    {transaction.status === 'borrowed' && (
                      <>
                        <button
                          onClick={() => handleExtend(transaction._id)}
                          disabled={extending[transaction._id]}
                          className="flex-1 modern-btn modern-btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <i className="bx bx-time text-lg"></i>
                          <span>{extending[transaction._id] ? 'Extending...' : 'Extend (7 days)'}</span>
                        </button>
                        <button
                          onClick={() => handleReturn(transaction._id)}
                          disabled={returning[transaction._id]}
                          className="flex-1 modern-btn modern-btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          <i className="bx bx-check text-lg"></i>
                          <span>{returning[transaction._id] ? 'Returning...' : 'Return'}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Returned Books History */}
        {returnedBooks.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <i className="bx bx-history text-lg md:text-xl text-black mr-3"></i>
              <h2 className="text-base md:text-lg font-bold text-black">
                Return History ({returnedBooks.length})
              </h2>
            </div>
            
            <div className="modern-card overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {returnedBooks.map((transaction) => (
                  <li key={transaction._id} className="px-8 py-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-black mb-1">
                          {transaction.book?.title || 'Unknown Book'}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          by {transaction.book?.author || 'Unknown Author'}
                        </p>
                        <div className="text-sm text-gray-500">
                          Borrowed: {new Date(transaction.borrowedAt).toLocaleDateString()} • 
                          Returned: {transaction.returnedAt ? new Date(transaction.returnedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewReviews(transaction.book)}
                          className="modern-btn bg-gray-900 text-white hover:bg-gray-800 flex items-center space-x-2 text-sm"
                        >
                          <i className="bx bx-star text-lg"></i>
                          <span>Review</span>
                        </button>
                        <span className={`px-3 py-1 text-sm rounded-full font-semibold ${getStatusColor(transaction.status, transaction.dueAt)}`}>
                          {transaction.status === 'overdue' ? 'Returned Late' : 'Returned'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      
      {/* Book Reviews Popup */}
      <BookReviewsPopup 
        book={selectedBook}
        isOpen={showReviewsPopup}
        onClose={handleCloseReviewsPopup}
        canWriteReview={true}
      />
    </div>
  );
}

export default MyBooks;
