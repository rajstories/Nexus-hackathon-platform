import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// Allowed MIME types for different file categories
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ],
  code: [
    'text/javascript',
    'application/javascript',
    'text/typescript',
    'text/html',
    'text/css',
    'application/json',
    'text/x-python',
    'text/x-java'
  ],
  archives: [
    'application/zip',
    'application/x-tar',
    'application/gzip'
  ]
};

// Dangerous file extensions that should never be allowed
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
  '.jar', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.run', '.msi',
  '.dll', '.so', '.dylib', '.sh', '.bash', '.zsh', '.fish', '.ps1'
];

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
  code: 2 * 1024 * 1024, // 2MB
  archive: 20 * 1024 * 1024, // 20MB
  default: 5 * 1024 * 1024 // 5MB
};

// Sanitize filename
const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  sanitized = path.basename(sanitized);
  
  // Remove special characters except dots and hyphens
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  
  // Ensure it doesn't start with a dot (hidden file)
  if (sanitized.startsWith('.')) {
    sanitized = '_' + sanitized.substring(1);
  }
  
  // Add timestamp to prevent collisions
  const ext = path.extname(sanitized);
  const name = path.basename(sanitized, ext);
  const timestamp = Date.now();
  
  return `${name}_${timestamp}${ext}`;
};

// Check if file extension is blocked
const isExtensionBlocked = (filename: string): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return BLOCKED_EXTENSIONS.includes(ext);
};

// Get file type category
const getFileCategory = (mimetype: string): string => {
  for (const [category, types] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (types.includes(mimetype)) {
      return category;
    }
  }
  return 'unknown';
};

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check for blocked extensions
  if (isExtensionBlocked(file.originalname)) {
    console.log(`[SECURITY] Blocked file upload - dangerous extension: ${file.originalname}`);
    return cb(new Error('File type not allowed - executable files are blocked'));
  }
  
  // Check MIME type
  const allAllowedTypes = Object.values(ALLOWED_MIME_TYPES).flat();
  if (!allAllowedTypes.includes(file.mimetype)) {
    console.log(`[SECURITY] Blocked file upload - invalid MIME type: ${file.mimetype}`);
    return cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
  
  // Additional check for disguised executables
  const buffer = (file as any).buffer;
  if (buffer) {
    const header = buffer.toString('hex', 0, 4);
    // Check for common executable headers
    const executableHeaders = ['4d5a9000', '7f454c46', 'feedface', 'cefaedfe'];
    if (executableHeaders.includes(header)) {
      console.log(`[SECURITY] Blocked file upload - executable header detected`);
      return cb(new Error('Executable files are not allowed'));
    }
  }
  
  cb(null, true);
};

// Create multer configuration
export const createUploadMiddleware = (options: {
  fieldName?: string;
  maxFiles?: number;
  fileTypes?: Array<keyof typeof ALLOWED_MIME_TYPES>;
}) => {
  const {
    fieldName = 'file',
    maxFiles = 1,
    fileTypes = ['images', 'documents']
  } = options;
  
  // Calculate max file size based on allowed types
  let maxSize = FILE_SIZE_LIMITS.default;
  for (const type of fileTypes) {
    const typeSize = FILE_SIZE_LIMITS[type as keyof typeof FILE_SIZE_LIMITS];
    if (typeSize && typeSize > maxSize) {
      maxSize = typeSize;
    }
  }
  
  const storage = multer.memoryStorage(); // Store in memory, never on disk
  
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: maxFiles,
      fields: 10, // Max number of non-file fields
      fieldSize: 1024 * 1024, // Max field value size (1MB)
      headerPairs: 100 // Max number of header key-value pairs
    }
  });
  
  // Return middleware with error handling
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = maxFiles === 1 
      ? upload.single(fieldName)
      : upload.array(fieldName, maxFiles);
    
    uploadHandler(req, res, (err) => {
      if (err) {
        console.error('[SECURITY] File upload error:', err);
        
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(413).json({
                error: 'File too large',
                message: `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB`
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                error: 'Too many files',
                message: `Maximum ${maxFiles} files allowed`
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                error: 'Unexpected field',
                message: 'File field name not recognized'
              });
            default:
              return res.status(400).json({
                error: 'Upload error',
                message: err.message
              });
          }
        }
        
        return res.status(400).json({
          error: 'Upload failed',
          message: err.message || 'File upload failed'
        });
      }
      
      // Sanitize filenames if upload succeeded
      if (req.file) {
        req.file.originalname = sanitizeFilename(req.file.originalname);
      } else if (req.files) {
        const files = req.files as Express.Multer.File[];
        files.forEach(file => {
          file.originalname = sanitizeFilename(file.originalname);
        });
      }
      
      next();
    });
  };
};

// Middleware to validate uploaded files further
export const validateUploadedFile = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file || (req.files as Express.Multer.File[])?.[0];
  
  if (!file) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please provide a file to upload'
    });
  }
  
  // Additional validation can be added here
  // For example, checking file content, running virus scans, etc.
  
  console.log(`[SECURITY] File upload validated: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
  
  next();
};

// Helper to get secure file upload limits
export const getUploadLimits = (fileType: string) => {
  const category = Object.entries(ALLOWED_MIME_TYPES)
    .find(([_, types]) => types.includes(fileType))?.[0];
  
  return {
    maxSize: FILE_SIZE_LIMITS[category as keyof typeof FILE_SIZE_LIMITS] || FILE_SIZE_LIMITS.default,
    allowedTypes: ALLOWED_MIME_TYPES[category as keyof typeof ALLOWED_MIME_TYPES] || [],
    category
  };
};