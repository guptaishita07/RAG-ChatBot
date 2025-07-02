import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// UPDATED PDF PARSING FUNCTIONS
async function parsePDFWithPDFJS(filePath) {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
    
    const dataBuffer = fs.readFileSync(filePath);
    const data = new Uint8Array(dataBuffer);
    
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return { text: fullText };
  } catch (error) {
    console.error('PDFJS parsing error:', error);
    throw error;
  }
}

async function parsePDFSimple(filePath) {
  try {
    // Try to use pdf-parse as fallback, but wrap in try-catch
    const pdf = await import('pdf-parse');
    const pdfParse = pdf.default;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return { text: data.text };
  } catch (error) {
    console.error('pdf-parse fallback error:', error);
    throw error;
  }
}

async function processPDF(filePath) {
  try {
    console.log('Processing PDF with primary parser:', filePath);
    return await parsePDFWithPDFJS(filePath);
  } catch (error) {
    console.log('Primary PDF parser failed, trying fallback...');
    try {
      return await parsePDFSimple(filePath);
    } catch (fallbackError) {
      console.error('All PDF parsers failed:', fallbackError);
      // Return basic info as last resort
      return { 
        text: `PDF file processed but text extraction failed. Filename: ${filePath}. Please try re-uploading the document.`,
        error: 'Could not extract text from PDF'
      };
    }
  }
}

class RAGHandler {
  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "models/embedding-001",
    });
    
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-1.5-pro-latest",
      temperature: 0.7,
    });
    
    this.vectorStore = null;
    this.documents = [];
    
    this.prompt = ChatPromptTemplate.fromTemplate(`
      Answer the questions based on the provided context only. 
      Please provide the most accurate response based on the question.
      If the answer is not in the context, say "I don't have information about that in the uploaded documents."
      
      Context: {context}
      
      Question: {input}
      
      Answer:
    `);
  }

  async processUploadedFiles(files) {
    try {
      const documents = [];
      
      for (const file of files) {
        if (file.mimetype === 'application/pdf') {
          console.log(`Processing PDF: ${file.originalname}`);
          
          // Use our new PDF processor instead of pdf-parse
          const pdfData = await processPDF(file.path);
          
          if (pdfData.error) {
            console.warn(`Warning: ${pdfData.error} for file ${file.originalname}`);
          }
          
          const doc = new Document({
            pageContent: pdfData.text,
            metadata: {
              filename: file.originalname,
              fileType: 'pdf',
              uploadDate: new Date().toISOString(),
              hasExtractionError: !!pdfData.error
            }
          });
          
          documents.push(doc);
          console.log(`✓ Successfully processed: ${file.originalname}`);
        }
        
        // Clean up uploaded file
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.warn('Could not clean up temporary file:', file.path);
        }
      }
      
      if (documents.length === 0) {
        throw new Error('No valid PDF files found');
      }
      
      // Split documents into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      
      console.log('Splitting documents into chunks...');
      const splitDocs = await textSplitter.splitDocuments(documents);
      console.log(`Created ${splitDocs.length} chunks from ${documents.length} documents`);
      
      // Create vector store
      console.log('Creating vector embeddings...');
      this.vectorStore = await FaissStore.fromDocuments(splitDocs, this.embeddings);
      this.documents = splitDocs;
      console.log('✓ Vector store created successfully');
      
      return {
        success: true,
        message: `Successfully processed ${documents.length} files into ${splitDocs.length} chunks`,
        data: {
          documentCount: documents.length,
          chunkCount: splitDocs.length
        }
      };
      
    } catch (error) {
      console.error('Error processing documents:', error);
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }
  
  async queryDocuments(query) {
    try {
      if (!this.vectorStore) {
        throw new Error('No documents have been uploaded yet. Please upload documents first.');
      }
      
      console.log('Querying documents for:', query);
      
      const retriever = this.vectorStore.asRetriever({
        k: 4,
      });
      
      const documentChain = await createStuffDocumentsChain({
        llm: this.llm,
        prompt: this.prompt,
      });
      
      const retrievalChain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever,
      });
      
      const response = await retrievalChain.invoke({
        input: query,
      });
      
      console.log('✓ Query completed successfully');
      
      return {
        answer: response.answer,
        sources: response.context.map(doc => ({
          content: doc.pageContent.substring(0, 200) + '...',
          metadata: doc.metadata
        })),
        type: 'rag'
      };
      
    } catch (error) {
      console.error('Error querying documents:', error);
      throw new Error(`Query failed: ${error.message}`);
    }
  }
  
  getDocumentStatus() {
    return {
      hasDocuments: this.vectorStore !== null,
      documentCount: this.documents.length,
      lastUpdate: this.documents.length > 0 ? new Date().toISOString() : null
    };
  }
  
  // Clear all documents (useful for testing)
  clearDocuments() {
    this.vectorStore = null;
    this.documents = [];
    return {
      success: true,
      message: 'All documents cleared successfully'
    };
  }
}

// Create singleton instance
const ragHandler = new RAGHandler();

export { ragHandler };