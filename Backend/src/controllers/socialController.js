import axios from 'axios'
import jwt from 'jsonwebtoken'
import { body, param, validationResult } from 'express-validator'
import linkedinConfig from '../config/linkedin.js'
import SocialAccount from '../models/socialModel.js'

// ─── Validation helper ────────────────────────────────────────────────────────
const handleValidation = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }
  return null
}

// ─── Step 1: Redirect user to LinkedIn login ──────────────────────────────────
export const linkedinAuth = (req, res) => {
  const token = req.query.token
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  // Basic JWT structure check before redirecting
  try {
    jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: linkedinConfig.clientId,
    redirect_uri: linkedinConfig.redirectUri,
    scope: linkedinConfig.scope.join(' '),
    state: token,
  })

  res.redirect(`${linkedinConfig.authUrl}?${params.toString()}`)
}

// ─── Step 2: Handle LinkedIn callback ────────────────────────────────────────
export const linkedinCallback = async (req, res) => {
  const { code, state } = req.query

  if (!code || !state) {
    return res.redirect(`${process.env.FRONTEND_URL}/connected?platform=linkedin&status=error`)
  }

  // Verify JWT from state
  let userId
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET)
    userId = decoded.id
  } catch {
    return res.redirect(`${process.env.FRONTEND_URL}/connected?platform=linkedin&status=error`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      linkedinConfig.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: linkedinConfig.redirectUri,
        client_id: linkedinConfig.clientId,
        client_secret: linkedinConfig.clientSecret,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )

    const { access_token, expires_in } = tokenResponse.data

    if (!access_token) {
      throw new Error('No access token received from LinkedIn')
    }

    // Get LinkedIn profile
    const profileResponse = await axios.get(linkedinConfig.profileUrl, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const profile = profileResponse.data

    if (!profile.sub) {
      throw new Error('Invalid profile data from LinkedIn')
    }

    // Save or update — accessToken auto-encrypted via pre('save') hook
    // findOneAndUpdate bypasses pre('save'), so use save() instead
    let account = await SocialAccount.findOne({ userId, platform: 'linkedin' })

    if (account) {
      account.platformUserId = profile.sub
      account.name = profile.name || ''
      account.email = profile.email || ''
      account.profilePicture = profile.picture || ''
      account.accessToken = access_token      // will be encrypted by pre('save')
      account.tokenExpiry = new Date(Date.now() + expires_in * 1000)
      account.isConnected = true
    } else {
      account = new SocialAccount({
        userId,
        platform: 'linkedin',
        platformUserId: profile.sub,
        name: profile.name || '',
        email: profile.email || '',
        profilePicture: profile.picture || '',
        accessToken: access_token,            // will be encrypted by pre('save')
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        isConnected: true,
      })
    }

    await account.save()

    res.redirect(`${process.env.FRONTEND_URL}/connected?platform=linkedin&status=success`)
  } catch (err) {
    console.error('LinkedIn callback error:', err.message)
    res.redirect(`${process.env.FRONTEND_URL}/connected?platform=linkedin&status=error`)
  }
}

// ─── Get all connected accounts ───────────────────────────────────────────────
export const getConnectedAccounts = async (req, res) => {
  try {
    const accounts = await SocialAccount.find({
      userId: req.user._id,
      isConnected: true,
    })
    // toJSON() auto-removes tokens (defined in model)
    res.status(200).json({ accounts })
  } catch (err) {
    res.status(500).json({ message: 'Server error' }) // don't expose err.message
  }
}

// ─── Disconnect an account ────────────────────────────────────────────────────
export const disconnectAccount = [
  param('platform')
    .isIn(['linkedin', 'facebook', 'instagram', 'twitter'])
    .withMessage('Invalid platform'),

  async (req, res) => {
    const validationError = handleValidation(req, res)
    if (validationError) return

    const { platform } = req.params
    try {
      const account = await SocialAccount.findOne({
        userId: req.user._id,
        platform,
      })

      // Ownership check — user can only disconnect their own account
      if (!account) {
        return res.status(404).json({ message: 'Account not found' })
      }

      account.isConnected = false
      await account.save()

      res.status(200).json({ message: `${platform} disconnected successfully` })
    } catch (err) {
      res.status(500).json({ message: 'Server error' })
    }
  },
]