import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ Thiếu OPENAI_API_KEY trong .env");
  process.exit(1);
}

app.use(express.json());
app.use(express.static("public"));

app.post("/api/tts/play", async (req, res) => {
  try {
    let { text, voice, language, speed } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Thiếu nội dung văn bản" });
    }

    if (language === "vi") text = "Đọc bằng tiếng Việt: " + text;
    else if (language === "en") text = "Read in English: " + text;

    if (speed === "slow") text += " (read slowly)";
    else if (speed === "fast") text += " (read quickly)";

    console.log("➡️ Gửi request TTS:", { voice, language, speed });

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: voice || "alloy",
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Lỗi OpenAI TTS:", response.status, errorText);
      return res.status(500).json({ error: "Không thể tạo giọng đọc" });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log("✅ Nhận audio (play), dung lượng:", buffer.length, "bytes");

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.post("/api/tts/download", async (req, res) => {
  try {
    let { text, voice, language, speed } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Thiếu nội dung văn bản" });
    }

    if (language === "vi") text = "Đọc bằng tiếng Việt: " + text;
    else if (language === "en") text = "Read in English: " + text;

    if (speed === "slow") text += " (read slowly)";
    else if (speed === "fast") text += " (read quickly)";

    console.log("➡️ Gửi request TTS (download):", { voice, language, speed });

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: voice || "alloy",
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Lỗi OpenAI TTS:", response.status, errorText);
      return res.status(500).json({ error: "Không thể tạo giọng đọc" });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log("✅ Nhận audio (download), dung lượng:", buffer.length, "bytes");

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "attachment; filename=voice.mp3");
    res.send(buffer);
  } catch (err) {
    console.error("❌ Server error:", err.message);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại: http://localhost:${PORT}`);
});
