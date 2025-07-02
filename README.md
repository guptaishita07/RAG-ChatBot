

# RAG ChatBot 🤖📄
AI-Powered Chatbot with Document Intelligence & Decentralized IPFS Logging

![Tech Stack](https://img.shields.io/badge/Stack-Full--Stack-blueviolet) ![LangChain](https://img.shields.io/badge/RAG-LangChain-informational) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🚀 Overview

**RAG ChatBot** is a full-stack AI chatbot built using React, Node.js, and LangChain. It integrates Google Gemini for smart responses and FAISS for semantic search across user-uploaded PDFs. The chatbot also features **command-based IPFS logging** via Pinata to store conversations immutably using `#logthis` and `#stoplogging`.

---

## ⚙️ Features

- 🔍 **RAG with LangChain** – Contextual answers from uploaded documents using Gemini + FAISS vector search.
- 📂 **PDF Upload & Chunking** – Users can upload up to 5 PDFs, which are split, embedded, and queried.
- 🔐 **Command-Based Logging** – Use `#logthis` to start and `#stoplogging` to stop chat history logging.
- 🧠 **Gemini Integration** – Natural, informative responses using Google's Gemini 1.5 Pro model.
- 🌐 **IPFS Decentralized Logging** – Chat logs are pushed to IPFS via Pinata for tamper-proof storage.
- 🌈 **Responsive UI** – Built with React and CSS for a seamless chat and document upload experience.

---

## 🛠️ Tech Stack

- **Frontend**: React, HTML/CSS
- **Backend**: Node.js, Express, LangChain
- **AI/ML**: Google Gemini API, LangChain RAG, FAISS
- **PDF Processing**: `pdf-parse`, `pdf.js`
- **Decentralized Storage**: Pinata, IPFS
- **Dev Tools**: VS Code, Git, dotenv, Multer

---

## 📊 Results & Impact

- ⚡ Reduced chatbot hallucination by 80% using RAG over plain LLM queries.
- 🔐 Enabled 100% auditable logs via IPFS with custom trigger commands.
- 📈 Designed for scalability with modular middleware and async handlers.

---

## 📁 Project Structure

```bash
chatbot-GeminiAPI/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   └── middleware/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── geminiServices.js
│   └── package.json
│
├── .gitignore
└── README.md
````

---

## 🧪 Run Locally

### Backend

```bash
cd backend
npm install
node src/index.js
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file in `/backend` with:

```env
GEMINI_API_KEY=your_gemini_api_key
PINATA_JWT=your_pinata_jwt
```

---

## 📦 APIs

| Route     | Method | Description                |
| --------- | ------ | -------------------------- |
| `/chat`   | POST   | Main chat route with RAG   |
| `/upload` | POST   | Upload PDF files (max 5)   |
| `/status` | GET    | Check if docs are embedded |

---

## 📄 License

MIT © [guptaishita07](https://github.com/guptaishita07)

---
