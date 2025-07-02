import { ragHandler } from '../Controllers/ragHandler.js';

export const processDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No files uploaded. Please upload PDF files.' 
      });
    }
    
    const result = await ragHandler.processUploadedFiles(req.files);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        documentCount: result.documentCount,
        chunkCount: result.chunkCount
      }
    });
    
  } catch (error) {
    console.error('Error in processDocuments middleware:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process documents' 
    });
  }
};

export const queryRAG = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const result = await ragHandler.queryDocuments(message);
    
    res.status(200).json({
      reply: result.answer,
      sources: result.sourceDocuments,
      type: 'rag'
    });
    
    console.log("RAG reply sent:", result.answer);
    
  } catch (error) {
    console.error('Error in queryRAG middleware:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to query documents' 
    });
  }
};

export const getDocumentStatus = async (req, res) => {
  try {
    const status = ragHandler.getDocumentStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('Error getting document status:', error);
    res.status(500).json({ error: 'Failed to get document status' });
  }
};

// Middleware to check if user wants RAG or normal chat
export const checkRAGMode = (req, res, next) => {
  const { message } = req.body;
  
  if (message && message.includes('#askdocs')) {
    req.useRAG = true;
    req.body.message = message.replace('#askdocs', '').trim();
  } else {
    req.useRAG = false;
  }
  
  next();
};