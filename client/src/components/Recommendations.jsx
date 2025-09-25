import React, { useState, useEffect } from 'react';
import { useToast } from './ToastProvider';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

function Recommendations({ user }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const toast = useToast();

  const questions = [
    {
      id: 'genre',
      question: "What's your favorite book genre?",
      options: [
        { value: 'fiction', label: 'Fiction', icon: 'bx-book' },
        { value: 'mystery', label: 'Mystery & Thriller', icon: 'bx-search' },
        { value: 'sci-fi', label: 'Science Fiction', icon: 'bx-rocket' },
        { value: 'fantasy', label: 'Fantasy', icon: 'bx-magic-wand' },
        { value: 'romance', label: 'Romance', icon: 'bx-heart' },
        { value: 'non-fiction', label: 'Non-Fiction', icon: 'bx-brain' },
        { value: 'biography', label: 'Biography', icon: 'bx-user' },
        { value: 'history', label: 'History', icon: 'bx-time' }
      ]
    },
    {
      id: 'mood',
      question: "What mood are you in for reading?",
      options: [
        { value: 'adventure', label: 'Adventure & Action', icon: 'bx-run' },
        { value: 'thoughtful', label: 'Thoughtful & Deep', icon: 'bx-brain' },
        { value: 'light', label: 'Light & Fun', icon: 'bx-smile' },
        { value: 'mysterious', label: 'Mysterious & Intriguing', icon: 'bx-search-alt' },
        { value: 'emotional', label: 'Emotional & Heartfelt', icon: 'bx-heart' },
        { value: 'educational', label: 'Educational & Informative', icon: 'bx-book-open' }
      ]
    },
    {
      id: 'length',
      question: "How long do you prefer your books?",
      options: [
        { value: 'short', label: 'Short (under 200 pages)', icon: 'bx-file' },
        { value: 'medium', label: 'Medium (200-400 pages)', icon: 'bx-book' },
        { value: 'long', label: 'Long (400+ pages)', icon: 'bx-library' },
        { value: 'any', label: 'Any length is fine', icon: 'bx-check' }
      ]
    },
    {
      id: 'setting',
      question: "What setting appeals to you most?",
      options: [
        { value: 'contemporary', label: 'Contemporary/Modern', icon: 'bx-building' },
        { value: 'historical', label: 'Historical', icon: 'bx-time' },
        { value: 'fantasy-world', label: 'Fantasy World', icon: 'bx-magic-wand' },
        { value: 'space', label: 'Space/Future', icon: 'bx-rocket' },
        { value: 'real-world', label: 'Real World Locations', icon: 'bx-world' },
        { value: 'any', label: 'Any setting works', icon: 'bx-check' }
      ]
    },
    {
      id: 'experience',
      question: "What kind of reading experience do you want?",
      options: [
        { value: 'page-turner', label: 'Page-turner that keeps me hooked', icon: 'bx-fast-forward' },
        { value: 'character-driven', label: 'Character development focus', icon: 'bx-user' },
        { value: 'plot-driven', label: 'Plot and story focus', icon: 'bx-list-ul' },
        { value: 'atmospheric', label: 'Atmospheric and immersive', icon: 'bx-cloud' },
        { value: 'thought-provoking', label: 'Thought-provoking and deep', icon: 'bx-brain' },
        { value: 'entertaining', label: 'Pure entertainment', icon: 'bx-smile' }
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      generateRecommendations();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/books/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(answers)
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setShowResults(true);
      } else {
        toast.error('Failed to generate recommendations. Please try again.');
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setRecommendations([]);
    setShowResults(false);
  };

  const currentQ = questions[currentQuestion];
  const isAnswered = answers[currentQ?.id];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-black mb-2">Generating Your Recommendations</h2>
          <p className="text-gray-600">Finding the perfect books for you...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="content-wrapper">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-black mb-2">Your Book Recommendations</h1>
                <p className="text-xs sm:text-sm text-gray-600">Based on your preferences, here are some books you might love</p>
              </div>
              <button
                onClick={restartQuiz}
                className="modern-btn modern-btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <i className="bx bx-refresh text-lg"></i>
                <span>Retake Quiz</span>
              </button>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="bx bx-book text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No recommendations found</h3>
              <p className="text-sm text-gray-600">Try adjusting your preferences or retake the quiz</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recommendations.map((book, index) => (
                <div key={book._id} className="modern-card p-4 sm:p-6 group hover:scale-105 transition-transform duration-200">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full w-fit">
                          #{index + 1}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600">Match: {book.matchScore}%</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-black mb-2 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-3">by {book.author}</p>
                    </div>
                  </div>

                  <div className="space-y-1 sm:space-y-2 text-xs text-gray-600 mb-3 sm:mb-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Category:</span>
                      <span className="text-gray-800">{book.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Available:</span>
                      <span className="text-gray-800">{book.totalCopies - book.borrowedCount}</span>
                    </div>
                    {book.rating && (
                      <div className="flex justify-between">
                        <span className="font-semibold">Rating:</span>
                        <span className="text-gray-800">{book.rating}/5 ⭐</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full w-fit">
                      {book.category}
                    </span>
                    
                    {book.totalCopies - book.borrowedCount > 0 ? (
                      <button className="modern-btn modern-btn-primary flex items-center justify-center space-x-2 text-sm w-full sm:w-auto">
                        <i className="bx bx-plus text-lg"></i>
                        <span>Borrow</span>
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500 text-center sm:text-right">Not Available</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="content-wrapper">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-black mb-2">Book Recommendations</h1>
          <p className="text-xs sm:text-sm text-gray-600">Answer a few questions to get personalized book recommendations</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-black">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-xs sm:text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="modern-card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-4 sm:mb-6 text-center">
            {currentQ.question}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {currentQ.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQ.id, option.value)}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  answers[currentQ.id] === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <i className={`bx ${option.icon} text-xl sm:text-2xl ${
                    answers[currentQ.id] === option.value ? 'text-blue-600' : 'text-gray-400'
                  }`}></i>
                  <span className="font-medium text-sm sm:text-base">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="modern-btn modern-btn-secondary flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <i className="bx bx-chevron-left text-base sm:text-lg"></i>
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          
          <span className="text-xs sm:text-sm text-gray-600">
            {currentQuestion + 1} of {questions.length}
          </span>
          
          <button
            onClick={nextQuestion}
            disabled={!isAnswered}
            className="modern-btn modern-btn-primary flex items-center space-x-1 sm:space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <span className="hidden sm:inline">{currentQuestion === questions.length - 1 ? 'Get Recommendations' : 'Next'}</span>
            <span className="sm:hidden">{currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}</span>
            <i className="bx bx-chevron-right text-base sm:text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
