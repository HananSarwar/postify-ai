import express from 'express'
import {
  optimizeCaption,
  optimizeHashtags,
  enhanceKeywords,
  analyzeContent,
} from '../controllers/optimizeController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/caption', protect, optimizeCaption)
router.post('/hashtags', protect, optimizeHashtags)
router.post('/keywords', protect, enhanceKeywords)
router.post('/analyze', protect, analyzeContent)

export default router