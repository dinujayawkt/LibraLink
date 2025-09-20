import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    messageType: { type: String, enum: ['text', 'image', 'book_share'], default: 'text' },
    attachments: [{
      type: { type: String, enum: ['image', 'book'] },
      url: String,
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
    }],
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true, trim: true, maxlength: 500 },
      createdAt: { type: Date, default: Date.now }
    }],
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      emoji: { type: String, required: true }
    }],
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
  },
  { timestamps: true }
);

// Index for efficient querying
messageSchema.index({ community: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
