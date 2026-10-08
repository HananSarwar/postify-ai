import gemini from '../config/gemini.js'
import Content from '../models/contentModel.js'
import Brand from '../models/brandModel.js'

const platformRules = {
  linkedin: 'Professional tone, max 3000 characters, 3-5 hashtags, include a call to action.',
  instagram: 'Engaging and visual, max 2200 characters, 10-15 hashtags, use emojis.',
  facebook: 'Conversational, max 500 characters, 3-5 hashtags, encourage interaction.',
  twitter: 'Concise, max 280 characters, 2-3 hashtags, punchy and direct.',
}

// @route POST /api/ai/generate-caption
export const generateCaption = async (req, res) => {
  const { topic, platform, tone, language = 'English' } = req.body

  if (!topic || !platform || !tone) {
    return res.status(400).json({ message: 'topic, platform and tone are required' })
  }

  try {
    const brand = await Brand.findOne({ userId: req.user._id })
    const brandContext = brand
      ? `Brand name: ${brand.brandName}. Industry: ${brand.industry}. Target audience: ${brand.targetAudience}. Brand description: ${brand.brandDescription}.`
      : ''

    const prompt = `
You are a professional social media content creator.

Generate a ${tone} social media caption for ${platform} about:
"${topic}"

${brandContext}

Platform rules:
${platformRules[platform] || platformRules.instagram}

Language: ${language}

Return ONLY a valid JSON object:
{
  "caption": "your caption here",
  "hashtags": ["hashtag1", "hashtag2"],
  "engagementScore": 85
}
`

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 1000,
        responseMimeType: 'application/json',
      },
    })

    const parsed = JSON.parse(response.text.trim())

    const saved = await Content.create({
      userId: req.user._id,
      platform,
      topic,
      tone,
      caption: parsed.caption,
      hashtags: parsed.hashtags,
      engagementScore: parsed.engagementScore,
    })

    res.status(200).json({
      message: 'Caption generated successfully',
      content: {
        id: saved._id,
        caption: parsed.caption,
        hashtags: parsed.hashtags,
        engagementScore: parsed.engagementScore,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate caption' })
  }
}

// @route POST /api/ai/generate-hashtags
export const generateHashtags = async (req, res) => {
  const { topic, platform, count = 10 } = req.body

  if (!topic || !platform) {
    return res.status(400).json({ message: 'topic and platform are required' })
  }

  try {
    const prompt = `
Generate ${count} trending and relevant hashtags for a ${platform} post about:
"${topic}"

Return ONLY a valid JSON object:
{
  "hashtags": ["hashtag1", "hashtag2"]
}
`

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 300,
        responseMimeType: 'application/json',
      },
    })

    const parsed = JSON.parse(response.text.trim())

    res.status(200).json({
      message: 'Hashtags generated successfully',
      hashtags: parsed.hashtags,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate hashtags' })
  }
}

// @route POST /api/ai/optimize-tone
export const optimizeTone = async (req, res) => {
  const { caption, targetTone, platform } = req.body

  if (!caption || !targetTone || !platform) {
    return res.status(400).json({ message: 'caption, targetTone and platform are required' })
  }

  try {
    const prompt = `
Rewrite this social media caption in a ${targetTone} tone for ${platform}:
"${caption}"

Return ONLY a valid JSON object:
{
  "optimizedCaption": "rewritten caption here",
  "changes": "brief description of what changed"
}
`

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 600,
        responseMimeType: 'application/json',
      },
    })

    const parsed = JSON.parse(response.text.trim())

    res.status(200).json({
      message: 'Tone optimized successfully',
      optimizedCaption: parsed.optimizedCaption,
      changes: parsed.changes,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to optimize tone' })
  }
}

// @route GET /api/ai/history
export const getHistory = async (req, res) => {
  try {
    const contents = await Content.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)

    res.status(200).json({ contents })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}