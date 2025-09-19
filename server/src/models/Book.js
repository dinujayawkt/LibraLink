import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: 'text' },
    author: { type: String, required: true, trim: true, index: true },
    isbn: { type: String, trim: true, index: true },
    category: { type: String, trim: true, index: true },
    coverUrl: { type: String },
    totalCopies: { type: Number, required: true, min: 0 },
    borrowedCount: { type: Number, default: 0 },
    locationCode: { type: String, trim: true },
  },
  { timestamps: true }
);

bookSchema.virtual('availableCopies').get(function availableCopies() {
  return Math.max(0, this.totalCopies - this.borrowedCount);
});

export default mongoose.model('Book', bookSchema);


