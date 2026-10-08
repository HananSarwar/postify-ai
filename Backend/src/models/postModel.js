import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    caption: { type: String, required: true },
    hashtags: [{ type: String }],
    mediaUrl: { type: String, default: null },
    mediaType: { type: String, enum: ['image', 'video', 'none'], default: 'none' },
  },
  platforms: [{
    type: String,
    enum: ['linkedin', 'facebook', 'instagram', 'twitter'],
  }],
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed', 'pending_review'],
    default: 'draft',
  },
  scheduledAt: { type: Date, default: null },
  publishedAt: { type: Date, default: null },
  platformResults: [{
    platform: String,
    success: Boolean,
    postId: String,
    error: String,
    publishedAt: Date,
  }],
  engagementScore: { type: Number, default: null },
  qualityScore: { type: Number, default: null },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
  },
  jobId: { type: String, default: null },
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema)
export default Post