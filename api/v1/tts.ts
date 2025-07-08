import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method \!== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text } = req.body;
    
    if (\!text) {
      res.status(400).json({ error: "Missing required parameter: text" });
      return;
    }

    // For now, return a mock response
    // TODO: Integrate with Google Cloud TTS
    const mockAudioResponse = {
      audioUrl: "data:audio/mp3;base64,mock-audio-data",
      duration: text.length * 0.1, // Rough estimate
      format: "mp3"
    };

    res.status(200).json(mockAudioResponse);
  } catch (error) {
    console.error("Error in TTS API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
