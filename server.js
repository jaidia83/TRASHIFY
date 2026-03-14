import express from "express";
import OpenAI from "openai";


const app = express();
app.use(express.json());


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


app.post("/recycle", async (req, res) => {
  const { item } = req.body;


  try {
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a recycling expert. Give clear, practical recycling instructions." },
        { role: "user", content: `How should I recycle a ${item}?` }
      ]
    });


    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get advice" });
  }
});


app.listen(3000, () => console.log("Server running on http://localhost:3000"));