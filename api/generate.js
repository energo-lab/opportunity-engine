export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured. Add it in Vercel Settings > Environment Variables." });
  }

  const { month, location } = req.body || {};
  if (!month || !location) {
    return res.status(400).json({ error: "Missing month or location" });
  }

  const isAU = location.includes("Austrálie") || location.includes("Australia");
  const country = isAU ? "Austrálii" : "Českou republiku";
  const countryShort = isAU ? "Austrálii" : "ČR";
  const localKey = isAU ? "localRelevance" : "czechRelevance";

  const prompt = `Proveď důkladný průzkum a analýzu podnikatelských, investičních a technologických příležitostí relevantních pro období ${month} 2026. Kontext: ${location} trhy.

Zaměř se na: neefektivity trhu, asymetrické příležitosti, emerging trendy, monetizační cesty, konkurenční prostředí a lokální relevanci pro ${country}.

Odpověz POUZE platným JSON polem (žádný markdown, žádné backticky) s přesně 12 objekty seřazenými podle expectedValue sestupně. Minimálně 4 příležitosti specifické pro ${countryShort}, zbylé globální. Struktura:
{
  "id": number,
  "rank": string ("01"-"12"),
  "title": string (krátký název česky),
  "category": string (česky),
  "expectedValue": number (0-100),
  "difficulty": number (0-100),
  "capital": string (česky),
  "timeHorizon": string (česky),
  "asymmetry": string ("Velmi vysoká"|"Vysoká"|"Střední"|"Nízká"),
  "competition": string (česky),
  "tags": string[] (2-3 tagy česky),
  "description": string (3-4 věty česky),
  "monetization": string[] (4 položky česky),
  "inefficiency": string (2-3 věty česky),
  "${localKey}": string (2-3 věty česky pro ${countryShort})
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic error:", response.status, errText);
      return res.status(502).json({ error: "Anthropic API error: " + response.status });
    }

    const data = await response.json();
    const textBlocks = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    if (!textBlocks) {
      return res.status(502).json({ error: "No text in API response" });
    }

    const cleaned = textBlocks.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      return res.status(502).json({ error: "Could not parse JSON" });
    }

    const opportunities = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ opportunities });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}
