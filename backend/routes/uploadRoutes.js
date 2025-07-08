import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect as auth } from '../middleware/auth.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    // Create subdirectories based on file type
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadsDir, 'avatars');
    } else if (file.fieldname === 'challengeFiles') {
      uploadPath = path.join(uploadsDir, 'challenges');
    } else if (file.fieldname === 'submissionFiles') {
      uploadPath = path.join(uploadsDir, 'submissions');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    challengeFiles: ['text/plain', 'application/json', 'application/zip'],
    submissionFiles: ['text/plain', 'application/zip', 'text/javascript', 'text/x-python']
  };

  const fieldAllowedTypes = allowedTypes[file.fieldname] || [];
  
  if (fieldAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldAllowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files per request
  }
});

// Upload avatar
router.post('/avatar', [auth, upload.single('avatar')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Update user's avatar in database
    await User.findByIdAndUpdate(req.user.id, { avatar: fileUrl });

    res.json({
      message: 'Avatar uploaded successfully',
      fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    // Clean up uploaded file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload challenge files
router.post('/challenge-files', [auth, upload.array('challengeFiles', 5)], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/challenges/${file.filename}`
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload submission files
router.post('/submission-files', [auth, upload.array('submissionFiles', 3)], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/submissions/${file.filename}`
    }));

    res.json({
      message: 'Submission files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    // Clean up uploaded files if there's an error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get file (serve static files)
router.get('/:folder/:filename', (req, res) => {
  try {
    const { folder, filename } = req.params;
    const allowedFolders = ['avatars', 'challenges', 'submissions'];
    
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ message: 'Invalid folder' });
    }

    const filePath = path.join(uploadsDir, folder, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Security check - make sure the resolved path is within uploads directory
    const resolvedPath = path.resolve(filePath);
    const uploadsPath = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(uploadsPath)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.sendFile(resolvedPath);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete file
router.delete('/:folder/:filename', auth, async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const allowedFolders = ['avatars', 'challenges', 'submissions'];
    
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ message: 'Invalid folder' });
    }

    const filePath = path.join(uploadsDir, folder, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Security check
    const resolvedPath = path.resolve(filePath);
    const uploadsPath = path.resolve(uploadsDir);
    
    if (!resolvedPath.startsWith(uploadsPath)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Additional authorization checks could be added here
    // For example, checking if the user owns the file

    fs.unlinkSync(resolvedPath);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's uploaded files
router.get('/my-files/:folder', auth, async (req, res) => {
  try {
    const { folder } = req.params;
    const allowedFolders = ['avatars', 'challenges', 'submissions'];
    
    if (!allowedFolders.includes(folder)) {
      return res.status(400).json({ message: 'Invalid folder' });
    }

    const folderPath = path.join(uploadsDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(folderPath).map(filename => {
      const filePath = path.join(folderPath, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${folder}/${filename}`
      };
    });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 5 files per request.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
});

export default router;
