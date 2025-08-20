import express from 'express';
import { verifyFirebaseToken, optionalAuth } from '../middleware/security';
import { createUploadMiddleware, validateUploadedFile } from '../middleware/fileUpload';

const router = express.Router();

// Test endpoint for checking security features
router.get('/security/test', (req, res) => {
  res.json({
    message: 'Security test endpoint',
    headers: {
      'x-powered-by': req.headers['x-powered-by'] || 'Header removed ✓',
      'x-content-type-options': res.getHeader('x-content-type-options'),
      'x-frame-options': res.getHeader('x-frame-options'),
      'x-xss-protection': res.getHeader('x-xss-protection'),
      'strict-transport-security': res.getHeader('strict-transport-security')
    },
    cors: {
      origin: req.headers.origin || 'No origin header',
      credentials: req.headers['access-control-allow-credentials']
    },
    rateLimit: {
      limit: '100 requests per 10 minutes',
      ip: req.ip
    }
  });
});

// Test protected endpoint
router.get('/security/protected', verifyFirebaseToken, (req: any, res) => {
  res.json({
    message: 'Access granted to protected resource',
    user: {
      uid: req.user?.uid,
      email: req.user?.email
    }
  });
});

// Test optional auth endpoint
router.get('/security/optional', optionalAuth, (req: any, res) => {
  res.json({
    message: 'Optional auth endpoint',
    authenticated: !!req.user,
    user: req.user ? {
      uid: req.user.uid,
      email: req.user.email
    } : null
  });
});

// Test file upload with security restrictions
router.post('/security/upload-test', 
  createUploadMiddleware({ 
    fieldName: 'file',
    maxFiles: 1,
    fileTypes: ['images', 'documents']
  }),
  validateUploadedFile,
  (req, res) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      message: 'File upload successful',
      file: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
      }
    });
  }
);

// Test input sanitization
router.post('/security/sanitize-test', (req, res) => {
  res.json({
    message: 'Input sanitization test',
    original: {
      script: '<script>alert("XSS")</script>',
      sql: "'; DROP TABLE users; --"
    },
    sanitized: req.body
  });
});

// Test rate limit by making multiple requests
router.get('/security/rate-limit-test', (req, res) => {
  res.json({
    message: 'Rate limit test endpoint',
    timestamp: new Date().toISOString(),
    requestNumber: 'Make 100+ requests to trigger rate limit'
  });
});

export default router;