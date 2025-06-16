import multer from 'multer';
import { ApiError } from './error.middleware.js';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type based on the route
  const isResume = req.originalUrl.includes('/candidates') && req.originalUrl.includes('/resume');
  
  if (isResume) {
    // For resume uploads, only allow PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new ApiError('Invalid file type. Only PDF files are allowed for resumes.', 400), false);
    }
  } else {
    // For other uploads (like avatars), allow images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.', 400), false);
    }
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError('File too large. Maximum size is 5MB.', 400));
        }
        return next(new ApiError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

export default upload;