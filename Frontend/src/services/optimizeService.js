import axios from 'axios'
const API = import.meta.env.VITE_API_URL + '/optimize'
const getToken = () => localStorage.getItem('token')
const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
})
export const optimizeCaptionAPI = async (data) => {
  const res = await axios.post(`${API}/caption`, data, { headers: headers() })
  return res.data
}
export const optimizeHashtagsAPI = async (data) => {
  const res = await axios.post(`${API}/hashtags`, data, { headers: headers() })
  return res.data
}
export const enhanceKeywordsAPI = async (data) => {
  const res = await axios.post(`${API}/keywords`, data, { headers: headers() })
  return res.data
}
export const analyzeContentAPI = async (data) => {
  const res = await axios.post(`${API}/analyze`, data, { headers: headers() })
  return res.data
}