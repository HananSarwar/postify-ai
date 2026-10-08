import mongoose from 'mongoose'
import crypto from 'crypto'

// ─── Encryption helpers (AES-256-GCM) ────────────────────────────────────────
const ALGO = 'aes-256-gcm'
const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY, 'hex') // 32 bytes = 64 hex chars

function encrypt(text) {
  if (!text) return ''
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Store as iv:authTag:encrypted (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

function decrypt(stored) {
  if (!stored) return ''
  const [ivHex, authTagHex, encryptedHex] = stored.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const socialAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  platform: {
    type: String,
    enum: ['linkedin', 'facebook', 'instagram', 'twitter'],
    required: true,
  },
  platformUserId: {
    type: String,
    required: true,
  },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  profilePicture: { type: String, default: '' },

  // Stored encrypted — never expose raw values in API responses
  accessToken: { type: String, required: true },
  refreshToken: { type: String, default: '' },

  tokenExpiry: { type: Date, default: null },
  isConnected: { type: Boolean, default: true },
}, { timestamps: true })

// One account per platform per user
socialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true })

// ─── Mongoose virtuals / methods ──────────────────────────────────────────────
// Encrypt before save
socialAccountSchema.pre('save', function (next) {
  if (this.isModified('accessToken') && this.accessToken) {
    this.accessToken = encrypt(this.accessToken)
  }
  if (this.isModified('refreshToken') && this.refreshToken) {
    this.refreshToken = encrypt(this.refreshToken)
  }
  next()
})

// Decrypt helper — call account.getAccessToken() in controllers/services
socialAccountSchema.methods.getAccessToken = function () {
  return decrypt(this.accessToken)
}
socialAccountSchema.methods.getRefreshToken = function () {
  return decrypt(this.refreshToken)
}

// Never expose tokens in JSON responses
socialAccountSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.accessToken
  delete obj.refreshToken
  return obj
}

const SocialAccount = mongoose.model('SocialAccount', socialAccountSchema)
export default SocialAccount