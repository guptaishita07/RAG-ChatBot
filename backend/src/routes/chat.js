import { Router } from "express";
import multer from 'multer';
import { checkFirst, logControl, unlogControl, recordChat, getChatLog} from "../middleware/recordChat.js";
import { getAIResponse } from "../middleware/aiReply.js";
import { checkRAGMode, queryRAG, processDocuments, getDocumentStatus } from "../middleware/ragMiddleware.js";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Your existing chat route with RAG support
router.route("/chat").post(
  checkFirst,
  logControl,
  unlogControl,
  checkRAGMode, // Check if user wants RAG
  (req, res, next) => {
    // Route to appropriate handler
    if (req.useRAG) {
      queryRAG(req, res); // Don't call next() here as queryRAG sends response
    } else {
      recordChat(req, res, next); // Continue to existing flow
    }
  },
  getChatLog,
  getAIResponse
);

// New RAG-specific routes
router.post('/upload', upload.array('documents', 5), processDocuments);
router.get('/status', getDocumentStatus);

export default router;