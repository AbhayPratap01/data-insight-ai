import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // IMPORTANT for Render

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// ✅ API route
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
          content: `Analyze this data:\n${JSON.stringify(data)}`
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

// ✅ Serve frontend
app.use(express.static("."));

// ✅ Root route
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "." });
});

// ✅ KEEP SERVER RUNNING
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});