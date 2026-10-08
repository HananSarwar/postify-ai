import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRoutes from './routes/authRoute.js'
import socialRoutes from './routes/socialRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import brandRoutes from './routes/brandRoutes.js'
import optimizeRoutes from './routes/optimizeRoutes.js'

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/social', socialRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/brand', brandRoutes)
app.use('/api/optimize', optimizeRoutes)

// Health check
app.get('/', (req, res) => res.send('Postify AI Server is running'))

export default app