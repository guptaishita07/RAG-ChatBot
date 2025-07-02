import { getGeminiResponse } from '../Controllers/geminiHandler.js';
import { uploadToIPFS } from "../Controllers/ipfsHandler.js";

let loggingActive = false;
const chatLog = [];


export const checkFirst = (req, res, next) => {
  const { message } = req.body;

  if (message && message.includes("#logthis")) {
    loggingActive = true;
  }

  if (!loggingActive) {
    console.log("Logging not active, just saying hi.");
    // return res.status(200).json({ message: "ok" }); 
  }

  next(); 
};

export const logControl = (req, res, next) => {
  const { message } = req.body;

  if (message && message.includes("#logthis")) {
    loggingActive = true;
    chatLog.length = 0; // Reset log
    console.log(" Logging activated.");
    // return res.status(200).json({ message: "Logging activated." }); 
  }

  req.loggingActive = loggingActive;
  next();
};

export const unlogControl = (req, res, next) => {
  const { message } = req.body;

  if (message && message.includes("#stoplogging")) {
    loggingActive = false;
    console.log("Logging deactivated.");
    // return res.status(200).json({ message: "Logging deactivated." }); 
  }

  req.loggingActive = loggingActive;
  next();
};

export const recordChat = async (req, res, next) => {
  const { message } = req.body;
  const aiReply = await getGeminiResponse(message);

  if (req.loggingActive && message) {
    chatLog.push({ message, timestamp: new Date() });
    chatLog.push({ aiReply , timestamp: new Date()}); 
    console.log("Chat logged:", message);
    // res.status(200).json({ message: "Chat recorded." }); //should use return here to stop further processing but we want to continue to next middleware
  

  try {
      const cid = await uploadToIPFS(chatLog)
      console.log("Stored current log at CID:", cid)
      req.chatCID = cid // You can use this in the response or next middleware
    } catch (err) {
      console.error("Failed to store chat log in IPFS")
    }
  }

  next();
};

export const getChatLog = (req, res, next) => {console.log(chatLog) 
next();
}
