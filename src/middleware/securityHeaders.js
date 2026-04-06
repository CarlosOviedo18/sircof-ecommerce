// Middleware para headers de seguridad HTTP
export const securityHeaders = (req, res, next) => {
  // Strict Transport Security (HSTS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; " +
    "style-src 'self' 'unsafe-inline' https: data:; " +
    "font-src 'self' https: data:; " +
    "img-src 'self' https: data: blob:; " +
    "connect-src 'self' https: wss:; " +
    "frame-src https://accounts.google.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'"
  );
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cross-Origin-Resource-Policy
  // Permitir cross-origin para Google OAuth y otros CDNs
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Cross-Origin-Opener-Policy
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  // Permissions-Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(self "https://api.paypal.com")'
  );
  
  next();
};
