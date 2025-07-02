import { getGeminiResponse } from "../Controllers/geminiHandler.js";

export const getAIResponse = async (req, res) => {
  const { message } = req.body;
    console.log("Received message:", message);
  if (!message) {
    return res.status(400).json({ reply: "Empty message." });
  }

  const aiReply = await getGeminiResponse(message);
  res.status(200).json({ reply: aiReply });
  console.log("AI reply sent:", aiReply);
  
};
