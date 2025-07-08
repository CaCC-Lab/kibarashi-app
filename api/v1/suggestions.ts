import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method \!== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { situation, duration } = req.query;
    
    if (\!situation || \!duration) {
      res.status(400).json({ 
        error: "Missing required parameters: situation and duration" 
      });
      return;
    }

    // For now, return static suggestions
    // TODO: Integrate with Gemini API and existing suggestion logic
    const mockSuggestions = [
      {
        id: "s001",
        title: "深呼吸でリラックス",
        description: "ゆっくりと深い呼吸を繰り返して、心と体を落ち着けましょう",
        duration: Number(duration),
        category: "cognitive"
      },
      {
        id: "s002", 
        title: "軽いストレッチ",
        description: "肩を回したり、首を伸ばしたり、軽いストレッチで体をほぐしましょう",
        duration: Number(duration),
        category: "behavioral"
      },
      {
        id: "s003",
        title: "好きな音楽を聴く",
        description: "お気に入りの曲を聴いて、気分をリフレッシュしましょう",
        duration: Number(duration),
        category: "behavioral"
      }
    ];

    res.status(200).json({ suggestions: mockSuggestions });
  } catch (error) {
    console.error("Error in suggestions API:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
