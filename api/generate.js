export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });

  const { month, location } = req.body || {};
  if (!month || !location) return res.status(400).json({ error: "Missing params" });

  const isAU = location.includes("Austrálie") || location.includes("Australia");
  const countryShort = isAU ? "Austrálii" : "ČR";
  const localKey = isAU ? "localRelevance" : "czechRelevance";

  const prompt = `Vytvoř JSON pole s 12 podnikatelskými příležitostmi pro ${month} 2026. Kontext: ${location}. Min 4 specifické pro ${countryShort}, zbytek globální.

POUZE JSON pole, žádný jiný text. Každý objekt:
{"title":"česky","category":"česky","expectedValue":85,"difficulty":50,"capital":"Nízký/Střední/Vysoký","timeHorizon":"3-6 měsíců","asymmetry":"Velmi vysoká/Vysoká/Střední","competition":"česky","tags":["t1","t2"],"description":"2-3 věty česky","monetization":["m1","m2","m3","m4"],"inefficiency":"1-2 věty česky","${localKey}":"1-2 věty česky"}

Seřaď dle expectedValue sestupně. Mix: AI, investice, energie, zdravotnictví, služby, niche trhy.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "API " + response.status, detail: errText.substring(0, 300) });
    }

    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(502).json({ error: "Parse error" });

    const opps = JSON.parse(match[0]).map((item, i) => ({
      ...item,
      id: i + 1,
      rank: String(i + 1).padStart(2, "0"),
    }));

    return res.status(200).json({ opportunities: opps });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
