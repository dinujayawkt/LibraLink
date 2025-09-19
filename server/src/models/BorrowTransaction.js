import mongoose from 'mongoose';

const borrowTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed', index: true },
    borrowedAt: { type: Date, default: Date.now },
    dueAt: { type: Date, required: true },
    returnedAt: { type: Date },
    borrowPhotoUrl: { type: String },
    returnPhotoUrl: { type: String },
    notes: { type: String, trim: true },
    extensions: [
      {
        extendedAt: { type: Date, default: Date.now },
        newDueAt: { type: Date, required: true },
        reason: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('BorrowTransaction', borrowTransactionSchema);


