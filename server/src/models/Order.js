import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    isbn: { type: String, trim: true },
    status: { type: String, enum: ['requested', 'approved', 'purchased', 'rejected'], default: 'requested', index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);


