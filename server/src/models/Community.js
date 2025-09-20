import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100, index: 'text' },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    category: { type: String, required: true, trim: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 100 },
    rules: [String],
    tags: [String],
  },
  { timestamps: true }
);

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for is full
communitySchema.virtual('isFull').get(function() {
  return this.members.length >= this.maxMembers;
});

export default mongoose.model('Community', communitySchema);
