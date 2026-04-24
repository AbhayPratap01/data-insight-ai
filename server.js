import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.static(__dirname));

// OpenRouter setup
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ✅ Home route (serves frontend)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Analyze route
app.get("/analyze", async (req, res) => {
  try {
    // 1. Fetch Apify data
    const response = await fetch(
      `https://api.apify.com/v2/datasets/EB9Fhc4CeylxWK97V/items?token=${process.env.APIFY_TOKEN}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Apify data");
    }

    const data = (await response.json()).slice(0, 5);

    // 2. Send to LLM
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "user",
          content: `
You are a data analyst.

Analyze this dataset and provide:
1. Summary
2. Key insights
3. Use cases

Data:
${JSON.stringify(data)}
`
        }
      ],
    });

    // 3. Send response
    res.json({
      success: true,
      data,
      analysis: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error("Error:", err.message);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});