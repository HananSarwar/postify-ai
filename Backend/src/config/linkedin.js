const linkedinConfig = {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI,
  scope: ['openid', 'profile', 'email', 'w_member_social'],
  authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  profileUrl: 'https://api.linkedin.com/v2/userinfo',
  postUrl: 'https://api.linkedin.com/v2/ugcPosts',
}

export default linkedinConfig