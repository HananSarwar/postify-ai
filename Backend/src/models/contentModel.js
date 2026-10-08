import mongoose from 'mongoose'

const contentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  platform: {
    type: String,
    enum: ['linkedin', 'instagram', 'facebook', 'twitter'],
    required: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  tone: {
    type: String,
    enum: ['formal', 'casual', 'witty', 'inspirational'],
    default: 'casual',
  },
  caption: {
    type: String,
    required: true,
  },
  hashtags: {
    type: [String],
    default: [],
  },
  engagementScore: {
    type: Number,
    default: 0,
  },
  isScheduled: {
    type: Boolean,
    default: false,
  },
  isSaved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true })

export default mongoose.model('Content', contentSchema)