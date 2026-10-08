import express from 'express'
import {
  generateCaption,
  generateHashtags,
  optimizeTone,
  getHistory,
} from '../controllers/aiController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/generate-caption', protect, generateCaption)
router.post('/generate-hashtags', protect, generateHashtags)
router.post('/optimize-tone', protect, optimizeTone)
router.get('/history', protect, getHistory)

export default router