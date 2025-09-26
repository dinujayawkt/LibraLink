import Book from '../models/Book.js';
import Review from '../models/Review.js';

export const createBookRecommendations = async (req, res) => {
  try {
    const { genre, mood, length, setting, experience } = req.body;

    console.log('Recommendation request:', { genre, mood, length, setting, experience });

    let query = {};

    if (genre && genre !== 'any') {
      query.category = { $regex: new RegExp(genre, 'i') };
    }

    let books = await Book.find(query).lean();

    const booksWithScores = books.map(book => {
      let score = 0;
      let reasons = [];

      if (genre && genre !== 'any') {
        if (book.category && book.category.toLowerCase().includes(genre.toLowerCase())) {
          score += 40;
          reasons.push('Matches your preferred genre');
        }
      } else {
        score += 20;
      }

      if (mood) {
        const moodMatches = {
          'adventure': ['action', 'adventure', 'thriller', 'mystery'],
          'thoughtful': ['philosophy', 'literature', 'biography', 'history'],
          'light': ['comedy', 'romance', 'young adult', 'children'],
          'mysterious': ['mystery', 'thriller', 'suspense', 'crime'],
          'emotional': ['romance', 'drama', 'biography', 'memoir'],
          'educational': ['non-fiction', 'science', 'history', 'biography']
        };

        const matchingMoods = moodMatches[mood] || [];
        const bookText = `${book.title} ${book.author} ${book.category || ''}`.toLowerCase();

        if (matchingMoods.some(moodWord => bookText.includes(moodWord))) {
          score += 25;
          reasons.push('Matches your reading mood');
        }
      }

      if (length && length !== 'any') {
        const estimatedPages = book.title.length * 2 + (book.author?.length || 0) * 1.5;

        if (length === 'short' && estimatedPages < 200) {
          score += 15;
          reasons.push('Matches your preferred length');
        } else if (length === 'medium' && estimatedPages >= 200 && estimatedPages <= 400) {
          score += 15;
          reasons.push('Matches your preferred length');
        } else if (length === 'long' && estimatedPages > 400) {
          score += 15;
          reasons.push('Matches your preferred length');
        }
      }

      if (setting && setting !== 'any') {
        const settingMatches = {
          'contemporary': ['modern', 'contemporary', 'current', 'today'],
          'historical': ['history', 'historical', 'past', 'ancient'],
          'fantasy-world': ['fantasy', 'magic', 'dragon', 'wizard'],
          'space': ['space', 'future', 'sci-fi', 'galaxy', 'planet'],
          'real-world': ['travel', 'country', 'city', 'place']
        };

        const matchingSettings = settingMatches[setting] || [];
        const bookText = `${book.title} ${book.author} ${book.category || ''}`.toLowerCase();

        if (matchingSettings.some(settingWord => bookText.includes(settingWord))) {
          score += 10;
          reasons.push('Matches your preferred setting');
        }
      }

      if (experience) {
        const experienceMatches = {
          'page-turner': ['thriller', 'mystery', 'suspense', 'action'],
          'character-driven': ['biography', 'memoir', 'drama', 'literature'],
          'plot-driven': ['mystery', 'thriller', 'adventure', 'crime'],
          'atmospheric': ['fantasy', 'horror', 'gothic', 'literature'],
          'thought-provoking': ['philosophy', 'science', 'history', 'biography'],
          'entertaining': ['comedy', 'romance', 'adventure', 'young adult']
        };

        const matchingExperiences = experienceMatches[experience] || [];
        const bookText = `${book.title} ${book.author} ${book.category || ''}`.toLowerCase();

        if (matchingExperiences.some(expWord => bookText.includes(expWord))) {
          score += 10;
          reasons.push('Matches your preferred experience');
        }
      }

      if (book.borrowedCount > 0) {
        score += Math.min(5, book.borrowedCount * 0.5);
        reasons.push('Popular among readers');
      }

      const availableCopies = book.totalCopies - book.borrowedCount;
      if (availableCopies > 0) {
        score += 2;
      }

      return {
        ...book,
        matchScore: Math.round(score),
        reasons: reasons.slice(0, 3)
      };
    });

    const sortedBooks = booksWithScores
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6)
      .filter(book => book.matchScore > 20);

    if (sortedBooks.length < 3) {
      const popularBooks = await Book.find()
        .sort({ borrowedCount: -1 })
        .limit(3)
        .lean();

      const additionalBooks = popularBooks
        .filter(book => !sortedBooks.some(rec => rec._id.toString() === book._id.toString()))
        .map(book => ({
          ...book,
          matchScore: 30,
          reasons: ['Popular choice among readers']
        }));

      sortedBooks.push(...additionalBooks);
    }

    const bookIds = sortedBooks.map(book => book._id);
    const ratings = await Review.aggregate([
      { $match: { book: { $in: bookIds }, isPublic: true } },
      {
        $group: {
          _id: '$book',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const booksWithRatings = sortedBooks.map(book => {
      const rating = ratings.find(r => r._id.toString() === book._id.toString());
      return {
        ...book,
        rating: rating ? Math.round(rating.averageRating * 10) / 10 : null,
        reviewCount: rating ? rating.reviewCount : 0
      };
    });

    res.json({
      recommendations: booksWithRatings,
      preferences: { genre, mood, length, setting, experience }
    });

  } catch (err) {
    console.error('Error generating recommendations:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
