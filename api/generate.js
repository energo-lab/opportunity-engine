export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });

  const { month, location } = req.body || {};
  if (!month || !location) return res.status(400).json({ error: "Missing month or location" });

  const isAU = location.includes("Austrálie") || location.includes("Australia");
  const countryShort = isAU ? "Austrálii" : "ČR";
  const localKey = isAU ? "localRelevance" : "czechRelevance";

  const prompt = `Jsi expert na analýzu trhů a podnikatelských příležitostí. Proveď analýzu příležitostí pro ${month} 2026 v kontextu: ${location}.

Vytvoř přesně 12 příležitostí seřazených podle expectedValue sestupně. Minimálně 4 musí být specifické pro ${countryShort}, zbylé globální. Mix oblastí: AI, investice, služby, niche trhy, regulatorní změny.

Odpověz POUZE platným JSON polem. Žádný markdown, žádné backticky, žádný text před nebo za polem. Struktura každého objektu:
{"id":1,"rank":"01","title":"název česky","category":"kategorie česky","expectedValue":85,"difficulty":50,"capital":"Nízký","timeHorizon":"3-6 měsíců","asymmetry":"Vysoká","competition":"Střední","tags":["tag1","tag2"],"description":"3-4 věty česky","monetization":["cesta1","cesta2","cesta3","cesta4"],"inefficiency":"2 věty česky","${localKey}":"2 věty česky pro ${countryShort}"}`;

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
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "API error " + response.status, detail: errText.substring(0, 500) });
    }

    const data = await response.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    if (!text) return res.status(502).json({ error: "Empty response" });

    const cleaned = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(502).json({ error: "Parse error", raw: cleaned.substring(0, 300) });

    const opportunities = JSON.parse(jsonMatch[0]);
    return res.status(200).json({ opportunities });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
