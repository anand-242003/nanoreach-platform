import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const ALLOWED_DOCUMENT_TYPES = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const MAX_FILE_SIZE = {
  document: 10 * 1024 * 1024, 
  image: 5 * 1024 * 1024, 
  avatar: 2 * 1024 * 1024, 
};

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const validateFileType = (file, allowedTypes) => {
  const ext = path.extname(file.originalname).toLowerCase();
  return allowedTypes.includes(ext);
};

const validateMimeType = (file, category) => {
  const allowedMimes = {
    document: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  };
  return allowedMimes[category]?.includes(file.mimetype);
};

const containsSuspiciousContent = (buffer) => {
  
  const suspicious = [
    Buffer.from('<?php', 'utf-8'),
    Buffer.from('<script', 'utf-8'),
    Buffer.from('eval(', 'utf-8'),
    Buffer.from('exec(', 'utf-8'),
  ];
  
  return suspicious.some(sig => buffer.includes(sig));
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = 'uploads/';

    if (file.fieldname === 'profilePicture' || file.fieldname === 'logo') {
      uploadDir += 'images/';
    } else if (file.fieldname === 'identityDocument' || file.fieldname === 'businessDocument') {
      uploadDir += 'documents/';
    } else {
      uploadDir += 'misc/';
    }

    if (req.user?.id) {
      uploadDir += `${req.user.id}/`;
    }
    
    ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  
  filename: (req, file, cb) => {
    
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const filename = `${timestamp}-${uniqueId}${ext}`;
    cb(null, filename);
  },
});

const createFileFilter = (category) => {
  return (req, file, cb) => {
    try {
      
      const allowedTypes = category === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
      if (!validateFileType(file, allowedTypes)) {
        return cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`), false);
      }

      if (!validateMimeType(file, category)) {
        return cb(new Error('Invalid file format detected'), false);
      }

      const originalname = file.originalname;
      if (!/^[a-zA-Z0-9._-]+$/.test(path.parse(originalname).name)) {
        return cb(new Error('Filename contains invalid characters'), false);
      }
      
      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  };
};

export const uploadDocument = multer({
  storage,
  fileFilter: createFileFilter('document'),
  limits: {
    fileSize: MAX_FILE_SIZE.document,
    files: 1,
  },
}).single('businessDocument');

export const uploadIdentity = multer({
  storage,
  fileFilter: createFileFilter('document'),
  limits: {
    fileSize: MAX_FILE_SIZE.document,
    files: 1,
  },
}).single('identityDocument');

export const uploadProfilePicture = multer({
  storage,
  fileFilter: createFileFilter('image'),
  limits: {
    fileSize: MAX_FILE_SIZE.avatar,
    files: 1,
  },
}).single('profilePicture');

export const uploadLogo = multer({
  storage,
  fileFilter: createFileFilter('image'),
  limits: {
    fileSize: MAX_FILE_SIZE.image,
    files: 1,
  },
}).single('logo');

export const uploadMultipleImages = multer({
  storage,
  fileFilter: createFileFilter('image'),
  limits: {
    fileSize: MAX_FILE_SIZE.image,
    files: 5, 
  },
}).array('images', 5);

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large',
        maxSize: Object.keys(MAX_FILE_SIZE).map(k => `${k}: ${MAX_FILE_SIZE[k] / 1024 / 1024}MB`).join(', ')
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files uploaded' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name' });
    }
    return res.status(400).json({ message: err.message });
  }
  
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  
  next();
};

export const validateUploadedFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const buffer = fs.readFileSync(req.file.path);

    if (containsSuspiciousContent(buffer)) {
      
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File contains suspicious content' });
    }

    if (req.file.mimetype.startsWith('image/')) {
      
      const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
      const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      const isGIF = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
      
      if (!isPNG && !isJPEG && !isGIF) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'File does not match image format' });
      }
    }
    
    if (req.file.mimetype === 'application/pdf') {
      
      const isPDF = buffer.toString('utf-8', 0, 4) === '%PDF';
      if (!isPDF) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'File does not match PDF format' });
      }
    }
    
    next();
  } catch (error) {
    console.error('File Validation Error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'File validation failed' });
  }
};

export const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    
    if (res.statusCode >= 400 && req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Cleanup Error:', err);
      }
    }
    originalSend.call(this, data);
  };
  
  next();
};

export default {
  uploadDocument,
  uploadIdentity,
  uploadProfilePicture,
  uploadLogo,
  uploadMultipleImages,
  handleUploadError,
  validateUploadedFile,
  cleanupOnError,
};
