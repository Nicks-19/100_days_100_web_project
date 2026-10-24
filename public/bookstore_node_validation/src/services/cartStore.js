const crypto = require('node:crypto');

const SESSION_COOKIE_NAME = 'bookstore_cart';
const carts = new Map();

function signValue(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [key, ...rest] = part.split('=');
      if (!key) return acc;
      acc[key] = decodeURIComponent(rest.join('='));
      return acc;
    }, {});
}

function parseSignedSessionId(signedValue, secret) {
  if (!signedValue || !signedValue.includes('.')) return null;

  const [sessionId, signature] = signedValue.split('.');
  if (!sessionId || !signature) return null;

  const expected = signValue(sessionId, secret);
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (receivedBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) return null;

  return sessionId;
}

function createSessionCookie(sessionId, secret) {
  return `${sessionId}.${signValue(sessionId, secret)}`;
}

function ensureSession(req, res, secret) {
  const cookies = parseCookies(req.headers.cookie);
  const existingSessionId = parseSignedSessionId(cookies[SESSION_COOKIE_NAME], secret);

  if (existingSessionId) {
    if (!carts.has(existingSessionId)) {
      carts.set(existingSessionId, new Map());
    }
    return existingSessionId;
  }

  const sessionId = crypto.randomBytes(16).toString('hex');
  carts.set(sessionId, new Map());

  const cookieValue = createSessionCookie(sessionId, secret);
  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(cookieValue)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=86400',
  ];

  if (process.env.NODE_ENV === 'production') {
    cookieParts.push('Secure');
  }

  res.setHeader('Set-Cookie', cookieParts.join('; '));

  return sessionId;
}

function getSessionCart(sessionId) {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, new Map());
  }
  return carts.get(sessionId);
}

function clearCart(sessionId) {
  carts.set(sessionId, new Map());
}

module.exports = {
  SESSION_COOKIE_NAME,
  clearCart,
  ensureSession,
  getSessionCart,
};
