import mongoose from 'mongoose'

const brandSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  brandName: {
    type: String,
    trim: true,
    default: '',
  },
  industry: {
    type: String,
    trim: true,
    default: '',
  },
  colors: {
    primary: { type: String, default: '#FFFFFF' },
    secondary: { type: String, default: '#000000' },
    accent: { type: String, default: '#534AB7' },
  },
  logoUrl: {
    type: String,
    default: '',
  },
  tone: {
    type: String,
    enum: ['formal', 'casual', 'witty', 'inspirational'],
    default: 'casual',
  },
  brandDescription: {
    type: String,
    default: '',
    trim: true,
  },
  targetAudience: {
    type: String,
    default: '',
    trim: true,
  },
}, { timestamps: true })

export default mongoose.model('Brand', brandSchema)