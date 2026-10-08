import { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import { generateCaptionAPI } from '../../services/aiService'
import { optimizeCaptionAPI, optimizeHashtagsAPI, analyzeContentAPI } from '../../services/optimizeService'

const platforms = ['linkedin', 'instagram', 'facebook', 'twitter']
const tones = ['formal', 'casual', 'witty', 'inspirational']
const languages = ['English', 'Urdu', 'Arabic', 'Hindi']

const AIContent = () => {
  const [form, setForm] = useState({
    topic: '',
    platform: 'linkedin',
    tone: 'casual',
    language: 'English',
  })
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [result, setResult] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGenerate = async () => {
    if (!form.topic.trim()) {
      setError('Please enter a topic!')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await generateCaptionAPI(form)
      setResult(data.content)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate. Try again!')
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    if (!result) return
    setOptimizing(true)
    try {
      const [captionRes, analysisRes] = await Promise.all([
        optimizeCaptionAPI({
          caption: result.caption,
          platform: form.platform,
        }),
        analyzeContentAPI({
          caption: result.caption,
          platform: form.platform,
        }),
      ])
      setResult({ ...result, caption: captionRes.data.optimizedCaption })
      setAnalysis(analysisRes.data)
    } catch (err) {
      setError('Failed to optimize!')
    } finally {
      setOptimizing(false)
    }
  }

  const handleOptimizeTone = async (newTone) => {
    if (!result) return
    setLoading(true)
    try {
      const data = await optimizeToneAPI({
        caption: result.caption,
        targetTone: newTone,
        platform: form.platform,
      })
      setResult({ ...result, caption: data.optimizedCaption })
    } catch (err) {
      setError('Failed to optimize tone!')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    const text = `${result.caption}\n\n${result.hashtags.map(h => `#${h.replace('#', '')}`).join(' ')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', background: '#0F0F0F', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '200px', flex: 1 }}>
        <TopBar title="AI Content Generator" />
        <div style={{ padding: '80px 24px 24px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* LEFT — Input Panel */}
            <div style={{
              background: '#1A1A1A',
              border: '0.5px solid #2A2A2A',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF' }}>
                ✦ Content Settings
              </div>

              {/* Topic */}
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Topic / Product</div>
                <input
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  placeholder="e.g. Summer sale — 40% off clothing"
                  style={{
                    width: '100%',
                    background: '#222',
                    border: '0.5px solid #2A2A2A',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Platform */}
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Platform</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {platforms.map(p => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, platform: p })}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: '0.5px solid',
                        borderColor: form.platform === p ? '#FFFFFF' : '#2A2A2A',
                        background: form.platform === p ? '#FFFFFF' : '#222',
                        color: form.platform === p ? '#000000' : '#888',
                        textTransform: 'capitalize',
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Tone of Voice</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {tones.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, tone: t })}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: '0.5px solid',
                        borderColor: form.tone === t ? '#FFFFFF' : '#2A2A2A',
                        background: form.tone === t ? '#FFFFFF' : '#222',
                        color: form.tone === t ? '#000000' : '#888',
                        textTransform: 'capitalize',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Language</div>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    background: '#222',
                    border: '0.5px solid #2A2A2A',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}>
                  {languages.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: '#2e1a1a',
                  color: '#F44336',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  border: '0.5px solid #F44336',
                }}>
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  background: loading ? '#333' : '#FFFFFF',
                  color: loading ? '#888' : '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 'auto',
                }}>
                {loading ? '⏳ Generating...' : '✦ Generate Content'}
              </button>
            </div>

            {/* RIGHT — Output Panel */}
            <div style={{
              background: '#1A1A1A',
              border: '0.5px solid #2A2A2A',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFFFFF' }}>
                ◫ Generated Content
              </div>

              {!result && !loading && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#555',
                  fontSize: '13px',
                  textAlign: 'center',
                  padding: '40px',
                }}>
                  Fill in the details and click Generate to create AI-powered content ✦
                </div>
              )}

              {loading && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#888',
                  fontSize: '13px',
                }}>
                  ⏳ AI is generating your content...
                </div>
              )}

              {result && (
                <>
                  {/* Caption */}
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Caption</div>
                    <div style={{
                      background: '#222',
                      border: '0.5px solid #2A2A2A',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px',
                      color: '#FFFFFF',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {result.caption}
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Hashtags</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {result.hashtags.map((tag, i) => (
                        <span key={i} style={{
                          background: '#2A2A2A',
                          color: '#FFFFFF',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                        }}>
                          #{tag.replace('#', '')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Engagement Score */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#888' }}>Engagement Score</div>
                    <div style={{
                      background: '#1a2e1a',
                      color: '#4CAF50',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {result.engagementScore} / 100
                    </div>
                  </div>

                  {/* Tone Optimize */}
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Optimize Tone</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {tones.map(t => (
                        <button
                          key={t}
                          onClick={() => handleOptimizeTone(t)}
                          disabled={loading}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            border: '0.5px solid #2A2A2A',
                            background: '#222',
                            color: '#888',
                            textTransform: 'capitalize',
                          }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Section */}
                  {analysis && (
                    <div style={{
                      background: '#222',
                      border: '0.5px solid #2A2A2A',
                      borderRadius: '8px',
                      padding: '12px',
                    }}>
                      <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                        ◈ Content Analysis
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                        {[
                          { label: 'Tone', value: analysis.tone },
                          { label: 'Sentiment', value: analysis.sentiment },
                          { label: 'Engagement', value: `${analysis.engagementScore}/100` },
                          { label: 'Platform Fit', value: `${analysis.platformScore}/100` },
                        ].map((item) => (
                          <div key={item.label} style={{
                            background: '#1A1A1A',
                            borderRadius: '6px',
                            padding: '8px',
                            textAlign: 'center',
                          }}>
                            <div style={{ fontSize: '10px', color: '#888' }}>{item.label}</div>
                            <div style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: '500', textTransform: 'capitalize' }}>
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      {analysis.suggestions && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Suggestions:</div>
                          {analysis.suggestions.map((s, i) => (
                            <div key={i} style={{ fontSize: '11px', color: '#4CAF50', marginBottom: '2px' }}>
                              → {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      onClick={handleCopy}
                      style={{
                        flex: 1,
                        background: '#222',
                        border: '0.5px solid #2A2A2A',
                        color: copied ? '#4CAF50' : '#888',
                        borderRadius: '8px',
                        padding: '9px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}>
                      {copied ? '✓ Copied!' : '⎘ Copy'}
                    </button>
                    <button
                      onClick={handleOptimize}
                      disabled={optimizing}
                      style={{
                        flex: 1,
                        background: '#222',
                        border: '0.5px solid #2A2A2A',
                        color: optimizing ? '#555' : '#FFFFFF',
                        borderRadius: '8px',
                        padding: '9px',
                        fontSize: '12px',
                        cursor: optimizing ? 'not-allowed' : 'pointer',
                      }}>
                      {optimizing ? '⏳ Optimizing...' : '◈ Optimize'}
                    </button>
                    <button
                      onClick={handleGenerate}
                      style={{
                        flex: 1,
                        background: '#222',
                        border: '0.5px solid #2A2A2A',
                        color: '#888',
                        borderRadius: '8px',
                        padding: '9px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}>
                      ↺ Regenerate
                    </button>
                    <button
                      style={{
                        flex: 1,
                        background: '#FFFFFF',
                        border: 'none',
                        color: '#000000',
                        borderRadius: '8px',
                        padding: '9px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500',
                      }}>
                      ◷ Schedule
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIContent