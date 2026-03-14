// ═══════════════════════════════════════════════
// JWT Verification Middleware
// Verifies Supabase-issued JWTs on every request
// ═══════════════════════════════════════════════

import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
    })
    req.user = {
      id:    decoded.sub,
      email: decoded.email,
    }
    next()
  } catch (err) {
    console.warn('[auth] Invalid token:', err.message)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
