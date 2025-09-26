import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Book from '../models/Book.js';

export const test = (req, res) => {
  res.json({ message: 'Reviews endpoint is working!' });
};

export const getBookReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ 
      book: req.params.bookId, 
      isPublic: true 
    })
    .populate('user', 'name')
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(Number(limit));

    const total = await Review.countDocuments({ 
      book: req.params.bookId, 
      isPublic: true 
    });

    res.json({ 
      reviews, 
      total, 
      page: Number(page), 
      limit: Number(limit) 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('book', 'title author coverUrl')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createReview = async (req, res) => {
  try {
    console.log('Review creation request:', req.body);
    console.log('User:', req.user);

    const { bookId, rating, title, content } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      console.log('Book not found:', bookId);
      return res.status(404).json({ message: 'Book not found' });
    }

    const existingReview = await Review.findOne({ 
      user: req.user.id, 
      book: bookId 
    });

    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this book' });
    }

    const review = await Review.create({
      user: req.user.id,
      book: bookId,
      rating,
      title,
      content
    });

    await review.populate('user', 'name');
    console.log('Review created successfully:', review);
    res.status(201).json(review);
  } catch (err) {
    console.error('Error creating review:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this book' });
    }
    res.status(400).json({ message: 'Invalid data' });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, title, content } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.reviewId, user: req.user.id },
      { rating, title, content, isEdited: true, editedAt: new Date() },
      { new: true }
    ).populate('user', 'name');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.reviewId,
      user: req.user.id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user.id;
    const isAlreadyHelpful = review.helpful.includes(userId);

    if (isAlreadyHelpful) {
      review.helpful.pull(userId);
    } else {
      review.helpful.push(userId);
    }

    await review.save();
    res.json({ 
      isHelpful: !isAlreadyHelpful, 
      helpfulCount: review.helpful.length 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBookStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(req.params.bookId), isPublic: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }

    const result = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    result.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    res.json({
      averageRating: Math.round(result.averageRating * 10) / 10,
      totalReviews: result.totalReviews,
      ratingDistribution: distribution
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
