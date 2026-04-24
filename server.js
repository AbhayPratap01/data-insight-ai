import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public")); // serve frontend

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ROOT ROUTE (important)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ANALYZE ROUTE
app.get("/analyze", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.apify.com/v2/datasets/EB9Fhc4CeylxWK97V/items?token=${process.env.APIFY_TOKEN}`
    );

    const data = (await response.json()).slice(0, 5);

    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [
        {
          role: "user",
          content: `
Analyze this dataset and return:
- Summary
- Key insights
- Use cases

Data:
${JSON.stringify(data)}
`
        }
      ],
    });

    res.json({
      data,
      analysis: completion.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});