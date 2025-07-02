import express from 'express';
import multer from 'multer';
import path from 'path';
import { ragHandler } from '../Controllers/ragHandler.js'; // Your existing RAG handler

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload PDF documents
router.post('/upload', upload.array('pdfs', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No PDF files uploaded' 
      });
    }

    console.log(`Received ${req.files.length} files for processing`);
    
    // Process uploaded files using your existing RAG handler
    const result = await ragHandler.processUploadedFiles(req.files);
    
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process uploaded files'
    });
  }
});

// Query documents using RAG
router.post('/query', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    console.log('Processing RAG query:', question);
    
    // Use your existing RAG handler
    const result = await ragHandler.queryDocuments(question);
    
    res.json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      type: result.type
    });

  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process query'
    });
  }
});

// Get document status
router.get('/status', (req, res) => {
  try {
    const status = ragHandler.getDocumentStatus();
    
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document status'
    });
  }
});

// Clear all documents
router.delete('/clear', (req, res) => {
  try {
    const result = ragHandler.clearDocuments();
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Clear error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear documents'
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'RAG service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;