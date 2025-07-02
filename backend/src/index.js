import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import chatRouter from "./routes/chat.js";
import fs from 'fs';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Chat API" });
});

app.use("/demo", chatRouter);

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Created uploads directory');
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
