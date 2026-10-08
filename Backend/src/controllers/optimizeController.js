import gemini from '../config/gemini.js'

// Helper function
const generateJSON = async (prompt) => {
  const response = await gemini.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  })

  return JSON.parse(response.text)
}

const platformRules = {
  linkedin: 'Professional, max 3000 chars, include CTA, 3-5 hashtags',
  instagram: 'Visual, engaging, emojis, max 2200 chars, 10-15 hashtags',
  facebook: 'Conversational, max 500 chars, encourage interaction',
  twitter: 'Concise, max 280 chars, punchy, 2-3 hashtags',
}

// @route POST /api/optimize/caption
export const optimizeCaption = async (req, res) => {
  const { caption, platform, targetAudience } = req.body

  if (!caption || !platform) {
    return res.status(400).json({ message: 'caption and platform are required' })
  }

  try {
    const prompt = `You are a social media optimization expert.

Optimize this ${platform} caption for maximum engagement:

"${caption}"

Platform rules:
${platformRules[platform] || platformRules.instagram}

Target audience:
${targetAudience || 'general audience'}

Return JSON with exactly these fields:
{
  "optimizedCaption": "improved caption here",
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "engagementScore": 85,
  "readabilityScore": 90,
  "platformScore": 88
}`

    const parsed = await generateJSON(prompt)

    res.status(200).json({
      message: 'Caption optimized successfully',
      data: parsed,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to optimize caption' })
  }
}

// @route POST /api/optimize/hashtags
export const optimizeHashtags = async (req, res) => {
  const { hashtags, platform, topic } = req.body

  if (!hashtags || !Array.isArray(hashtags) || !platform || !topic) {
    return res.status(400).json({ message: 'hashtags (array), platform and topic are required' })
  }

  try {
    const prompt = `You are a hashtag optimization expert.

Optimize these hashtags for ${platform} about "${topic}".

Current hashtags:
${hashtags.join(', ')}

Analyze and improve them for maximum relevance, reach and engagement.

Return JSON with exactly these fields:
{
  "optimizedHashtags": ["hashtag1", "hashtag2"],
  "removedHashtags": ["bad_hashtag1"],
  "addedHashtags": ["new_hashtag1"],
  "reason": "brief explanation",
  "reachScore": 85
}`

    const parsed = await generateJSON(prompt)

    res.status(200).json({
      message: 'Hashtags optimized successfully',
      data: parsed,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to optimize hashtags' })
  }
}

// @route POST /api/optimize/keywords
export const enhanceKeywords = async (req, res) => {
  const { caption, platform, industry } = req.body

  if (!caption || !platform) {
    return res.status(400).json({ message: 'caption and platform are required' })
  }

  try {
    const prompt = `You are a keyword enhancement expert for social media.

Enhance this ${platform} caption with better keywords for the ${industry || 'general'} industry.

Caption:
"${caption}"

Add relevant keywords, power words, and SEO-friendly terms while keeping the caption natural and engaging.

Return JSON with exactly these fields:
{
  "enhancedCaption": "caption with enhanced keywords",
  "addedKeywords": ["keyword1", "keyword2"],
  "powerWords": ["word1", "word2"],
  "seoScore": 85
}`

    const parsed = await generateJSON(prompt)

    res.status(200).json({
      message: 'Keywords enhanced successfully',
      data: parsed,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to enhance keywords' })
  }
}

// @route POST /api/optimize/analyze
export const analyzeContent = async (req, res) => {
  const { caption, platform } = req.body

  if (!caption || !platform) {
    return res.status(400).json({ message: 'caption and platform are required' })
  }

  try {
    const prompt = `Analyze this ${platform} social media caption:

"${caption}"

Return JSON with exactly these fields:
{
  "tone": "formal/casual/witty/inspirational",
  "sentiment": "positive/negative/neutral",
  "engagementScore": 85,
  "readabilityScore": 90,
  "platformScore": 88,
  "overallScore": 87,
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}`

    const parsed = await generateJSON(prompt)

    res.status(200).json({
      message: 'Content analyzed successfully',
      data: parsed,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to analyze content' })
  }
}