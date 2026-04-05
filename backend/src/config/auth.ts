export const authConfig = {
  jwtSecret: process.env.JWT_SECRET ?? (() => { throw new Error('JWT_SECRET is required'); })(),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? (() => { throw new Error('JWT_REFRESH_SECRET is required'); })(),
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY ?? '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY ?? '7d',
  cookieSecret: process.env.COOKIE_SECRET ?? (() => { throw new Error('COOKIE_SECRET is required'); })(),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  appleClientId: process.env.APPLE_CLIENT_ID,
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
};
