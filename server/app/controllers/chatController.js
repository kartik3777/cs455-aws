const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const chatController = {
  chat: async (req, res) => {
    try {
      const { message } = req.body || {};
      if (!message?.trim()) return res.status(400).json({ reply: "Please type a message." });

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
        temperature: 0.3,
      });

      const reply = completion.choices?.[0]?.message?.content?.trim() || "Hmm, I'm not sure.";
      return res.json({ reply });
    } catch (e) {
  console.error("chat error:", e);
  if (e.code === "insufficient_quota" || e.status === 429) {
    return res.json({
      reply:
        "⚠️ My AI brain is temporarily out of quota. Please change the API key.",
    });
  }
  return res.status(500).json({ reply: "Sorry, something went wrong." });
}

  },
};

module.exports = chatController;
