const sanitizeSecret = (text) => {
  if (typeof text !== 'string') {
    return text;
  }

  let sanitized = text;

  // Gather all potential secrets from process.env
  const secretsToRedact = [
    process.env.MONGO_URI,
    process.env.ACCESS_TOKEN_SECRET,
    process.env.REFRESH_TOKEN_SECRET,
    process.env.EMAIL_USER,
    process.env.EMAIL_PASSWORD,
    process.env.CLOUDINARY_API_SECRET,
    process.env.PAYMONGO_SECRET_KEY,
    process.env.LOCATIONIQ_ACCESS_TOKEN,
  ];

  // Try parsing the password out of MONGO_URI to redact it separately if present
  if (process.env.MONGO_URI) {
    try {
      const match = process.env.MONGO_URI.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/i) || 
                    process.env.MONGO_URI.match(/mongodb:\/\/([^:]+):([^@]+)@/i);
      if (match && match[2]) {
        secretsToRedact.push(match[2]);
      }
    } catch (e) {
      // Ignore parser errors
    }
  }

  // Deduplicate and filter out short/empty strings (e.g. minimum length of 4) to avoid false positive redacting
  const validSecrets = [...new Set(secretsToRedact)]
    .filter(secret => secret && typeof secret === 'string' && secret.length > 3);

  // Redact all occurrences of actual secrets
  for (const secret of validSecrets) {
    const escapedSecret = secret.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedSecret, 'gi');
    sanitized = sanitized.replace(regex, '[REDACTED]');
  }

  // Redact common patterns: e.g. "key=xxxxx", "token=xxxxx", "password=xxxxx", "pass=xxxxx"
  sanitized = sanitized.replace(/(key|token|password|secret|pass|auth|jwt)([^a-zA-Z0-9]*)(=[a-zA-Z0-9\-._~%!*]+|:[a-zA-Z0-9\-._~%!*]+)/gi, (match, p1, p2) => {
    return `${p1}${p2}=[REDACTED]`;
  });

  // Redact Authorization headers if logged (e.g. Bearer JWT)
  sanitized = sanitized.replace(/bearer\s+[a-zA-Z0-9\-._~+\/]+=*/gi, 'Bearer [REDACTED]');

  return sanitized;
};

const sanitizeObject = (obj) => {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return sanitizeSecret(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object') {
    const sanitizedObj = {};
    for (const key of Object.keys(obj)) {
      if (/password|secret|token|key|pass|auth|jwt/i.test(key)) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitizedObj;
  }
  return obj;
};

module.exports = { sanitizeSecret, sanitizeObject };
