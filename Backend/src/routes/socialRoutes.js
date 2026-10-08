import express from 'express'
import {
  linkedinAuth,
  linkedinCallback,
  getConnectedAccounts,
  disconnectAccount,
} from '../controllers/socialController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// LinkedIn OAuth — no protect, token comes via query param (state)
router.get('/linkedin', linkedinAuth)
router.get('/linkedin/callback', linkedinCallback)

// Connected accounts
router.get('/accounts', protect, getConnectedAccounts)

// disconnectAccount is an array [validator, handler] — spread it
router.delete('/disconnect/:platform', protect, ...disconnectAccount)

export default router