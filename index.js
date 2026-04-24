import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function run() {
  // 1. Get Apify data
const res = await fetch(
  `https://api.apify.com/v2/datasets/EB9Fhc4CeylxWK97V/items?token=${process.env.APIFY_TOKEN}`
);
const data = await res.json();
  // 2. Send to FREE model
  const completion = await openai.chat.completions.create({
    model: "meta-llama/llama-3-8b-instruct", // free model
    messages: [
      {
        role: "user",
        content: `Analyze this data: ${JSON.stringify(data)}`
      }
    ],
  });

  console.log(completion.choices[0].message.content);
}

run();