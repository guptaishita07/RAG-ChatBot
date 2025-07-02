import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import chatRouter from "./routes/chat.js";
import ragRouter from "./routes/rag.js"; // Add this import
import fs from 'fs';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to the Chat API",
    endpoints: {
      chat: "/demo/chat",
      rag: "/api/rag",
      upload: "/api/rag/upload",
      query: "/api/rag/query"
    }
  });
});

// Existing chat routes
app.use("/demo", chatRouter);

// New RAG routes
app.use("/api/rag", ragRouter);

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Created uploads directory');
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- Chat: POST /demo/chat');
  console.log('- Upload PDFs: POST /api/rag/upload');
  console.log('- Query Documents: POST /api/rag/query');
  console.log('- Document Status: GET /api/rag/status');
});