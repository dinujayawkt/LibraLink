import React from 'react';

function BookDetailsPopup({ book, isOpen, onClose }) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              {/* Book Cover */}
              <div className="w-24 h-36 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
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
              
              {/* Book Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-black mb-2">{book.title}</h2>
                <p className="text-lg text-gray-600 mb-2">by {book.author}</p>
                {book.category && (
                  <span className="inline-block px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                    {book.category}
                  </span>
                )}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <i className="bx bx-x text-xl text-gray-600"></i>
            </button>
          </div>

          {/* Book Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">ISBN</h3>
                <p className="text-gray-900">{book.isbn || 'Not available'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Total Copies</h3>
                <p className="text-gray-900">{book.totalCopies}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Available</h3>
                <p className="text-gray-900">{book.totalCopies - book.borrowedCount}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Borrowed</h3>
                <p className="text-gray-900">{book.borrowedCount}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900 leading-relaxed">
                {book.description || 'No description available for this book. This is a placeholder description that would normally contain information about the book\'s content, plot summary, or other relevant details.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button className="flex-1 modern-btn modern-btn-primary flex items-center justify-center space-x-2">
                <i className="bx bx-plus text-lg"></i>
                <span>Add to Wishlist</span>
              </button>
              {book.totalCopies - book.borrowedCount > 0 ? (
                <button className="flex-1 modern-btn modern-btn-primary flex items-center justify-center space-x-2">
                  <i className="bx bx-book text-lg"></i>
                  <span>Borrow Book</span>
                </button>
              ) : (
                <div className="flex-1 bg-gray-200 text-gray-600 py-3 px-4 rounded-lg text-center font-semibold">
                  Not Available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsPopup;
