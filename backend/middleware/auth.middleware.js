// Auth Middleware — Firebase Token Decoder
// Decodes Firebase JWT without Admin SDK verification
// Works without serviceAccountKey.json

const decodeFirebaseToken = (token) => {
  try {
    const base64Payload = token.split('.')[1]
    const padded = base64Payload + '=='.slice((base64Payload.length + 2) % 4 || 2)
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
    return {
      uid:   payload.user_id || payload.sub,
      email: payload.email   || '',
      name:  payload.name    || '',
    }
  } catch (err) {
    return null
  }
}

// protect — must be logged in
export const protect = async (req, res, next) => {
  try {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please login to continue',
      })
    }

    const user = decodeFirebaseToken(token)

    if (!user || !user.uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      })
    }

    req.user = user
    return next()

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}

// optionalAuth — works with or without login
export const optionalAuth = async (req, res, next) => {
  try {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      req.user = null
      return next()
    }

    const user = decodeFirebaseToken(token)
    req.user = user || null

    return next()
  } catch {
    req.user = null
    return next()
  }
}
// export const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith("Bearer ")) return next();
//     const token   = authHeader.split(" ")[1];
//     const admin   = (await import("../config/firebase.admin.js")).default;
//     const decoded = await admin.auth().verifyIdToken(token);
//     req.user = decoded;
//     next();
//   } catch {
//     next();
//   }
// };
  
  
  
  