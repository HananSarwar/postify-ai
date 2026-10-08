import express from 'express'
import { saveBrand, getBrand, updateBrand } from '../controllers/brandController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/save', protect, saveBrand)
router.get('/get', protect, getBrand)
router.put('/update', protect, updateBrand)

export default router