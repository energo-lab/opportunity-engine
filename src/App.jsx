import { useState, useRef, useCallback } from "react";

const months = [
  "Leden","Únor","Březen","Duben","Květen","Červen",
  "Červenec","Srpen","Září","Říjen","Listopad","Prosinec",
];

const locations = [
  { id: "cz", label: "🇨🇿 Svět + Česká republika", searchLabel: "globální + Česká republika" },
  { id: "au", label: "🇦🇺 Svět + Austrálie", searchLabel: "globální + Austrálie" },
];

const metricInfo = {
  ev: { label: "EV — Očekávaná hodnota", desc: "Skóre 0–100 kombinující pravděpodobnost úspěchu × potenciální výnos. Čím vyšší, tím atraktivnější poměr šance/zisk." },
  difficulty: { label: "Náročnost realizace", desc: "Skóre 0–100 vyjadřující úroveň technických, časových a znalostních bariér. Nízká = snadno proveditelné, vysoká = vyžaduje expertízu a zdroje." },
  capital: { label: "Kapitál", desc: "Odhadovaná výše počáteční investice. Nízký = do 100k Kč, Střední = 100k–1M Kč, Vysoký = nad 1M Kč." },
  asymmetry: { label: "Asymetrie riziko/výnos", desc: "Poměr mezi maximální ztrátou a maximálním ziskem. 'Velmi vysoká' = omezený downside, mnohonásobný upside potenciál." },
};

const defaultOpportunities = [
  {
    id: 1, rank: "01", title: "AI Automatizační Konzulting",
    category: "AI & Technologie", categoryColor: "#00f0ff",
    expectedValue: 95, difficulty: 55, capital: "Nízký",
    timeHorizon: "3–6 měsíců", asymmetry: "Velmi vysoká",
    competition: "Střední (rychle roste)",
    tags: ["B2B", "Služby", "Škálovatelné"],
    description: "78 % organizací již používá AI, ale většina nemá interní odborníky na implementaci. Poptávka po konzultantech, kteří pomáhají firmám nasadit agentní AI, automatizovat workflow a integrovat nástroje, raketově roste. Marže 50–70 %.",
    monetization: ["Konzultační služby za 2 000–10 000 Kč/hod","Implementační projekty (100k–500k Kč)","Měsíční retainer za správu AI agentů","Online kurzy pro firmy"],
    inefficiency: "Obrovská mezera mezi dostupnou technologií a schopností firem ji nasadit. Zejména v ČR a CEE regionu je tato mezera ještě větší než v USA.",
    czechRelevance: "V ČR 80 % business service center nasazuje AI, ale chybí lokální konzultanti v češtině. Příležitost pro first-movery.",
  },
  {
    id: 2, rank: "02", title: "Energetická Infrastruktura pro AI",
    category: "Energie & Infrastruktura", categoryColor: "#f0ff00",
    expectedValue: 90, difficulty: 70, capital: "Střední až vysoký",
    timeHorizon: "6–18 měsíců", asymmetry: "Vysoká", competition: "Nízká",
    tags: ["Investice", "Infrastruktura", "Dlouhodobé"],
    description: "AI datová centra požírají elektřinu. Goldman Sachs odhaduje zdvojnásobení podílu datových center na spotřebě do 2030. Utility sektor a firmy v energetice jsou podhodnocené — forward P/E pod průměrem S&P 500.",
    monetization: ["Investice do utility ETF (XLU) a energetických akcií","Solární/větrné instalace pro datová centra","Mikrogridy a bateriové úložiště","Energetický consulting pro tech firmy"],
    inefficiency: "Trh oceňuje AI firmy, ale podhodnocuje energetickou infrastrukturu, bez které AI nemůže fungovat. Klasická informační asymetrie.",
    czechRelevance: "Dukovany — výstavba nových reaktorů. ČR přechází z uhlí na čistou energii. Obrovský investiční potenciál v obnovitelných zdrojích.",
  },
  {
    id: 3, rank: "03", title: "Vertikální AI SaaS pro Niche Odvětví",
    category: "AI & Technologie", categoryColor: "#00f0ff",
    expectedValue: 88, difficulty: 65, capital: "Střední",
    timeHorizon: "6–12 měsíců", asymmetry: "Velmi vysoká",
    competition: "Nízká v nicheích",
    tags: ["SaaS", "B2B", "Škálovatelné"],
    description: "Generické AI modely nestačí pro specifické obory jako právo, medicína, účetnictví. Firmy chtějí AI natrénovanou na vlastních datech. Trh agentní AI orchestrace roste z $5,8B na $48,7B do 2034.",
    monetization: ["SaaS předplatné $49–299/měsíc","Setup fee $500–$2 000","Vertikální AI agent pro právníky/lékaře/účetní","White-label řešení pro agentury"],
    inefficiency: "Velké AI firmy se soustředí na horizontální řešení. Vertikální niché zůstávají neobsazené — přitom zákazníci v nich platí prémiové ceny.",
    czechRelevance: "České firmy v business services (214 000 zaměstnanců) aktivně hledají AI nástroje. Lokalizovaný vertikální SaaS v češtině = modrý oceán.",
  },
  {
    id: 4, rank: "04", title: "Zdravotnictví & HealthTech",
    category: "Zdravotnictví", categoryColor: "#00ff88",
    expectedValue: 85, difficulty: 60, capital: "Střední",
    timeHorizon: "6–18 měsíců", asymmetry: "Vysoká", competition: "Střední",
    tags: ["Investice", "Služby", "Regulované"],
    description: "Healthcare sektor underperformoval S&P 500 za posledních 2,5 roku a obchoduje se za historicky nízké valuace. Současně AI revoluce ve zdravotnictví teprve začíná — od diagnostiky po administrativu.",
    monetization: ["Investice do healthcare ETF a biotech","Wellness coaching a mikro-coaching platformy","AI nástroje pro zdravotnickou administrativu","Telemedicína a digitální zdravotní služby"],
    inefficiency: "Regulační nejistota stlačila valuace, ale fundamenty se zlepšují. Healthcare neobchodoval s prémií k S&P od roku 2000 — potenciál mean reversion.",
    czechRelevance: "Česká vláda prosazuje reformy zdravotnictví. Nedostatek 200 000+ pracovníků = příležitost pro automatizaci a telehealth.",
  },
  {
    id: 5, rank: "05", title: "Generační Obměna Firem v ČR",
    category: "M&A & Finance", categoryColor: "#ff6b00",
    expectedValue: 82, difficulty: 50, capital: "Střední až vysoký",
    timeHorizon: "12–24 měsíců", asymmetry: "Vysoká", competition: "Nízká",
    tags: ["ČR-specifické", "Akvizice", "Dlouhodobé"],
    description: "M&A trh v ČR vzrostl o 25 % meziročně na 260 transakcí. Od ledna 2026 padl strop 40M Kč na daňové osvobození příjmů z prodeje podílů. Generační obměna vlastníků je klíčový motor.",
    monetization: ["Akvizice podhodnocených SME firem","Poradenství při generační obměně","Search fund model — najít, koupit, řídit","Roll-up strategie v fragmentovaných odvětvích"],
    inefficiency: "Mnoho úspěšných českých firem s tržbami 10–100M Kč nemá nástupce. Vlastníci často prodávají pod hodnotou, protože neznají trh.",
    czechRelevance: "Přímo česká příležitost. Nová daňová pravidla od 2026 motivují vlastníky k transakcím. Český kapitál expanduje i do zahraničí.",
  },
  {
    id: 6, rank: "06", title: "Finanční Sektor — Rotace z Tech",
    category: "Investice", categoryColor: "#ff00aa",
    expectedValue: 80, difficulty: 30, capital: "Variabilní",
    timeHorizon: "3–12 měsíců", asymmetry: "Střední",
    competition: "Vysoká (ale trh je obrovský)",
    tags: ["Investice", "Pasivní", "Rotace"],
    description: "Mag7 klesly ~7 % YTD v 2026. Trh přechází od oceňování potenciálu AI k vyžadování důkazů ziskovosti. Finanční sektor (forward P/E ~16,5) je podhodnocený vs tech.",
    monetization: ["Sektorová rotace: XLF (financials ETF)","Podhodnocené akcie: Bank of America, Capital One, PNC","Alternativní asset manažeři (private credit)","Senior housing REITs (demografický tailwind)"],
    inefficiency: "Pozornost trhu je fixovaná na AI. Finanční, průmyslový a utility sektor nabízí lepší risk/reward profil při nižších valuacích.",
    czechRelevance: "Globální investiční příležitost přístupná přes české brokerské účty. České banky také benefitují z ekonomického růstu ČR.",
  },
  {
    id: 7, rank: "07", title: "Kybernetická Bezpečnost jako Služba",
    category: "AI & Technologie", categoryColor: "#00f0ff",
    expectedValue: 78, difficulty: 60, capital: "Nízký až střední",
    timeHorizon: "3–9 měsíců", asymmetry: "Vysoká", competition: "Střední",
    tags: ["B2B", "Služby", "Recurring Revenue"],
    description: "Kyberútoky se automatizují pomocí AI — obrana musí držet krok. Gartner projektuje růst výdajů na bezpečnostní služby o 15 % na $86B. Zaměstnanost v sektoru roste 29 % do 2034.",
    monetization: ["Managed security services pro SME","AI-powered SOC (Security Operations Center)","Penetrační testování a audit","Školení zaměstnanců v kyber hygieně"],
    inefficiency: "SME firmy vědí, že potřebují kyber ochranu, ale nemají rozpočet na interní tým. Outsourcovaná řešení za zlomek ceny = masivní trh.",
    czechRelevance: "ČR má silnou IT komunitu. 380 business service center potřebuje kyber zabezpečení. NIS2 směrnice EU zvyšuje regulační tlak.",
  },
  {
    id: 8, rank: "08", title: "Cirkulární Ekonomika & Sustainability",
    category: "Udržitelnost", categoryColor: "#44ff44",
    expectedValue: 75, difficulty: 45, capital: "Nízký až střední",
    timeHorizon: "6–18 měsíců", asymmetry: "Střední", competition: "Nízká v ČR",
    tags: ["ESG", "E-commerce", "EU regulace"],
    description: "Cirkulární ekonomika dosáhne $712B v 2026. Firmy přecházejí na cirkulární procurement — pronájem, oprava, resale místo nákupu nového. EU Green Deal vytváří regulační tlak i příležitosti.",
    monetization: ["Industrial reuse platformy a marketplace","Sustainable subscription boxy","Eco-friendly služby (čistírny, landscaping)","ESG consulting pro české firmy"],
    inefficiency: "Regulace EU předbíhá schopnost firem se přizpůsobit. Kdo pomůže s compliance a zároveň ušetří náklady, má dvojí výhodu.",
    czechRelevance: "ČR odchází od uhlí. EU fondy na obnovu do konce 2026. Silná příležitost v obnovitelných zdrojích a waste managementu.",
  },
  {
    id: 9, rank: "09", title: "Micro-Learning & AI Vzdělávání",
    category: "EdTech", categoryColor: "#aa88ff",
    expectedValue: 73, difficulty: 40, capital: "Nízký",
    timeHorizon: "3–6 měsíců", asymmetry: "Vysoká", competition: "Střední",
    tags: ["Digitální produkt", "Škálovatelné", "Recurring"],
    description: "50 %+ zaměstnanců bude potřebovat nové digitální dovednosti do 2026. E-learning trh přesáhne $450B. Gamifikace ve vzdělávání dosáhne $27,5B.",
    monetization: ["Online kurzy s AI tutorem (předplatné)","Corporate training programy","Notion/AI šablony a knowledge boxy","Coaching platformy se specializací"],
    inefficiency: "Tradiční vzdělávání je pomalé a drahé. Firmy potřebují rychlé, cílené reskilling. Kdo dodá AI-powered řešení v lokálním jazyce, vyhrává.",
    czechRelevance: "České firmy masivně investují do upskillingu. Nedostatek pracovníků (200k+ pozic) = urgentní poptávka po vzdělávacích řešeních.",
  },
  {
    id: 10, rank: "10", title: "AgeTech & Seniorní Služby",
    category: "Demografické Trendy", categoryColor: "#ff8844",
    expectedValue: 70, difficulty: 35, capital: "Nízký",
    timeHorizon: "6–12 měsíců", asymmetry: "Střední", competition: "Velmi nízká v ČR",
    tags: ["Služby", "Demografický trend", "Stabilní"],
    description: "63M Američanů pečuje o seniory. Senior housing REITs benefitují z demografického tailwindu baby boomerů. Smart home a mobility nástroje pro seniory rostou tiše, ale stabilně.",
    monetization: ["Domácí péče a asistentské služby","Smart home instalace pro seniory","Senior-friendly tech produkty","Investice do senior housing REITs"],
    inefficiency: "Stárnoucí populace je mega-trend, ale většina startupů se soustředí na mladé. Senior segment je masivně underserved.",
    czechRelevance: "ČR stárne rychle. Nedostatek pečovatelů. Technologická řešení pro seniory v češtině prakticky neexistují.",
  },
  {
    id: 11, rank: "11", title: "České Obranné Zakázky & Duální Technologie",
    category: "Obrana", categoryColor: "#ff4444",
    expectedValue: 68, difficulty: 65, capital: "Střední",
    timeHorizon: "12–24 měsíců", asymmetry: "Vysoká", competition: "Nízká v ČR",
    tags: ["ČR-specifické", "B2G", "Regulované"],
    description: "Česká vláda navyšuje výdaje na obranu a plánuje významné zakázky. Roste poptávka po duálních technologiích — drony, kyber obrana, komunikační systémy. EU Defence Fund přináší nové financování.",
    monetization: ["Subdodávky pro obranné projekty","Vývoj duálních drone technologií","Kyber obrana pro státní instituce","Konzulting pro čerpání EU Defence Fondu"],
    inefficiency: "Velké zahraniční firmy dominují, ale české SME mají výhodu v agilitě a lokálním know-how. Většina českých tech firem tento sektor ignoruje.",
    czechRelevance: "ČR navyšuje obranný rozpočet nad 2 % HDP. Domácí obranný průmysl má tradici, ale chybí moderní tech startupy v tomto sektoru.",
  },
  {
    id: 12, rank: "12", title: "Autonomní Robotika & Fyzická AI",
    category: "Robotika", categoryColor: "#00f0ff",
    expectedValue: 65, difficulty: 75, capital: "Vysoký",
    timeHorizon: "12–36 měsíců", asymmetry: "Velmi vysoká", competition: "Střední globálně",
    tags: ["Deep Tech", "Automatizace", "Průmysl 4.0"],
    description: "Fyzická AI umožňuje robotům navigovat reálné nepředvídatelné prostředí. Humanoidní roboti začínají podporovat skladování a logistiku. Trh dosáhne desítek miliard USD do konce dekády.",
    monetization: ["Robotické řešení pro sklady a logistiku","Autonomní inspekční drony","Integrace robotiky do výrobních linek","Vývoj senzorických a navigačních systémů"],
    inefficiency: "AI software je daleko napřed oproti hardwarové integraci. Kdo dokáže spojit pokročilé AI modely s fyzickými systémy, získá obrovskou výhodu.",
    czechRelevance: "ČR má silný průmyslový základ a tradici v automatizaci. ČVUT a VUT produkují kvalitní robotické inženýry. Příležitost pro spin-offy z akademie.",
  },
];

const categoryColorMap = {
  "AI & Technologie": "#00f0ff", "Energie & Infrastruktura": "#f0ff00",
  "Zdravotnictví": "#00ff88", "M&A & Finance": "#ff6b00",
  "Investice": "#ff00aa", "Udržitelnost": "#44ff44",
  "EdTech": "#aa88ff", "Demografické Trendy": "#ff8844",
  "Kybernetická bezpečnost": "#00f0ff", "Fintech": "#ff00aa",
  "Nemovitosti": "#f0ff00", "E-commerce": "#ff6b00",
  "Robotika": "#00f0ff", "Obrana": "#ff4444",
  "Těžba & Suroviny": "#f0ff00", "AgriTech": "#44ff44",
  "Turismus": "#aa88ff", "Logistika": "#ff8844",
};

const categoryIcons = {
  "AI & Technologie": "⚡", "Energie & Infrastruktura": "🔋",
  "Zdravotnictví": "🏥", "M&A & Finance": "🏦", "Investice": "📈",
  "Udržitelnost": "♻️", "EdTech": "🎓", "Demografické Trendy": "👴",
  "Kybernetická bezpečnost": "🔒", "Fintech": "💳",
  "Nemovitosti": "🏠", "E-commerce": "🛒", "Robotika": "🤖", "Obrana": "🛡️",
  "Těžba & Suroviny": "⛏️", "AgriTech": "🌾", "Turismus": "✈️", "Logistika": "🚛",
};

const loadingMessages = [
  "Prohledávám trhy a trendy…",
  "Analyzuji neefektivity…",
  "Hodnotím asymetrii rizika…",
  "Mapuji monetizační cesty…",
  "Skenování globálních dat…",
  "Vyhodnocuji konkurenční prostředí…",
  "Identifikuji lokální příležitosti…",
  "Sestavuji ranking…",
];

async function fetchOpportunities(monthName, locationLabel) {
  const localRelevanceField = locationLabel.includes("Česká")
    ? '"czechRelevance": string (2-3 věty česky, specificky pro ČR)'
    : '"localRelevance": string (2-3 věty česky, specificky pro Austrálii)';
  const localRelevanceKey = locationLabel.includes("Česká") ? "czechRelevance" : "localRelevance";

  const prompt = `Proveď důkladný průzkum a analýzu podnikatelských, investičních a technologických příležitostí relevantních pro období ${monthName} 2026. Kontext: ${locationLabel} trhy. Hledej aktuální trendy, tržní neefektivity, regulační změny a emerging sektory relevantní jak globálně, tak pro ${locationLabel.includes("Česká") ? "Českou republiku" : "Austrálii"}.

Zaměř se na:
1. Neefektivity trhu (informační asymetrie, technologické disrupce, regulační změny)
2. Asymetrické příležitosti (omezený downside, velký upside)
3. Emerging trendy (nová infrastruktura, kapitálové přílivy, rychlá adopce)
4. Praktické monetizační cesty
5. Konkurenční prostředí
6. Lokální relevanci pro ${locationLabel.includes("Česká") ? "ČR" : "Austrálii"}

Odpověz POUZE platným JSON polem (žádný markdown, žádné backticky) s přesně 12 objekty seřazenými podle expectedValue sestupně. Minimálně 4 příležitosti musí být specifické pro ${locationLabel.includes("Česká") ? "Českou republiku" : "Austrálii"}, zbylé jsou globální. Struktura:
{
  "id": number,
  "rank": string ("01"-"12"),
  "title": string (krátký název česky),
  "category": string (česky),
  "expectedValue": number (0-100, kombinace pravděpodobnost × potenciální výnos),
  "difficulty": number (0-100, technické/znalostní/časové bariéry),
  "capital": string (česky: "Nízký", "Střední", "Vysoký" apod.),
  "timeHorizon": string (česky),
  "asymmetry": string ("Velmi vysoká"|"Vysoká"|"Střední"|"Nízká"),
  "competition": string (česky),
  "tags": string[] (2-3 tagy česky),
  "description": string (3-4 věty česky s konkrétními daty),
  "monetization": string[] (přesně 4 položky česky),
  "inefficiency": string (2-3 věty česky),
  "${localRelevanceKey}": string (2-3 věty česky, specificky pro ${locationLabel.includes("Česká") ? "ČR" : "Austrálii"})
}

Zahrň mix oblastí — AI, investice, služby, niche trhy, regulatorní změny. Minimálně 4 příležitosti specifické pro ${locationLabel.includes("Česká") ? "ČR" : "Austrálii"}, zbylých 8 globálních.`;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: monthName, location: locationLabel }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    if (!data.opportunities) throw new Error("No data");
    return data.opportunities.map((item, i) => ({
      ...item,
      id: i + 1,
      rank: String(i + 1).padStart(2, "0"),
      categoryColor: categoryColorMap[item.category] || "#00f0ff",
      czechRelevance: item.czechRelevance || item.localRelevance || "",
    }));
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

// --- UI Components ---

function BarChart({ value, color, label }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8a8a9a", marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color }}>{value}/100</span>
      </div>
      <div style={{ height: 6, background: "#1a1a2e", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", background: "#ffffff08", border: "1px solid #ffffff15", borderRadius: 20, fontSize: 11, color: "#8a8a9a", marginRight: 6, marginBottom: 4 }}>
      {children}
    </span>
  );
}

function Tooltip({ info, children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", cursor: "help" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
    >
      {children}
      <span style={{ marginLeft: 3, fontSize: 10, color: "#4a4a6a", verticalAlign: "super" }}>ⓘ</span>
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: "#16163a", border: "1px solid #ffffff18", borderRadius: 8,
          padding: "10px 14px", width: 260, zIndex: 200, pointerEvents: "none",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#e0e0e8", marginBottom: 4 }}>{info.label}</div>
          <div style={{ fontSize: 11, lineHeight: 1.5, color: "#8a8a9a" }}>{info.desc}</div>
          <div style={{
            position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%) rotate(45deg)",
            width: 10, height: 10, background: "#16163a", borderRight: "1px solid #ffffff18", borderBottom: "1px solid #ffffff18",
          }} />
        </div>
      )}
    </span>
  );
}

function LoadingOverlay({ message }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "#0a0a14f0", zIndex: 100,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(6px)",
    }}>
      <div style={{ position: "relative", width: 56, height: 56, marginBottom: 24 }}>
        <div style={{ position: "absolute", inset: 0, border: "2px solid #ffffff08", borderTop: "2px solid #00f0ff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 6, border: "2px solid #ffffff08", borderBottom: "2px solid #ff6b00", borderRadius: "50%", animation: "spin 1.5s linear infinite reverse" }} />
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#00f0ff", letterSpacing: 1, textAlign: "center", maxWidth: 300 }}>{message}</div>
      <div style={{ marginTop: 16, width: 200, height: 3, background: "#1a1a2e", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, #00f0ff, #ff6b00)", borderRadius: 2, animation: "loading 2s ease-in-out infinite" }} />
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loading { 0%{width:0%;margin-left:0%} 50%{width:60%;margin-left:20%} 100%{width:0%;margin-left:100%} }
      `}</style>
    </div>
  );
}

// --- Main ---

export default function OpportunityEngine() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("Vše");
  const [month, setMonth] = useState(2);
  const [location, setLocation] = useState("cz");
  const [opportunities, setOpportunities] = useState(defaultOpportunities);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({ "2_cz": defaultOpportunities });
  const msgInterval = useRef(null);

  const cacheKey = (m, l) => `${m}_${l}`;
  const currentLocation = locations.find((l) => l.id === location);
  const localRelevanceLabel = location === "cz" ? "🇨🇿 Relevance pro ČR" : "🇦🇺 Relevance pro Austrálii";

  const doFetch = useCallback(async (m, l) => {
    const key = cacheKey(m, l);
    setSelected(null);
    setFilter("Vše");
    setError(null);

    if (cache[key]) {
      setOpportunities(cache[key]);
      return;
    }

    const loc = locations.find((x) => x.id === l);
    setLoading(true);
    let msgIdx = 0;
    setLoadingMsg(loadingMessages[0]);
    msgInterval.current = setInterval(() => {
      msgIdx = (msgIdx + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[msgIdx]);
    }, 2800);

    const result = await fetchOpportunities(months[m], loc.searchLabel);
    clearInterval(msgInterval.current);

    if (result) {
      setOpportunities(result);
      setCache((prev) => ({ ...prev, [key]: result }));
    } else {
      setError("Nepodařilo se načíst data. Zkuste to znovu.");
    }
    setLoading(false);
  }, [cache]);

  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
    doFetch(newMonth, location);
  };

  const handleLocationChange = (newLoc) => {
    setLocation(newLoc);
    doFetch(month, newLoc);
  };

  const categories = ["Vše", ...new Set(opportunities.map((o) => o.category))];
  const filtered = filter === "Vše" ? opportunities : opportunities.filter((o) => o.category === filter);
  const selectedOpp = opportunities.find((o) => o.id === selected);

  const selectStyle = (active) => ({
    background: "#12122a", border: active ? "1px solid #00f0ff44" : "1px solid #ffffff18", borderRadius: 8,
    padding: "5px 10px", color: loading ? "#4a4a5a" : "#00f0ff",
    fontSize: 12, fontFamily: "'Space Mono', monospace", cursor: loading ? "not-allowed" : "pointer",
    outline: "none", appearance: "none", WebkitAppearance: "none", paddingRight: 24,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2300f0ff'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
    opacity: loading ? 0.5 : 1,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#e0e0e8", fontFamily: "'DM Sans', 'Segoe UI', -apple-system, sans-serif", padding: 0, overflow: "hidden", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {loading && <LoadingOverlay message={loadingMsg} />}

      {/* Header */}
      <div style={{ padding: "32px 28px 20px", borderBottom: "1px solid #ffffff08", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, #00f0ff08 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 4, color: "#00f0ff", textTransform: "uppercase", marginBottom: 8 }}>
          ◆ Opportunity Discovery Engine
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1.2, background: "linear-gradient(135deg, #e0e0e8, #00f0ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Příležitosti pro Vaška a Honzu ;-)
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
          <p style={{ fontSize: 13, color: "#6a6a7a", margin: 0, marginRight: 4 }}>
            {loading ? "Generuji průzkum příležitostí…" : `${opportunities.length} příležitostí seřazených dle EV.`}
          </p>

          {/* Month selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "#4a4a5a", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>MĚSÍC:</span>
            <select value={month} onChange={(e) => handleMonthChange(Number(e.target.value))} disabled={loading} style={selectStyle()}>
              {months.map((m, i) => (
                <option key={i} value={i} style={{ background: "#0a0a14", color: "#e0e0e8" }}>
                  {m} 2026 {cache[cacheKey(i, location)] && !(i === 2 && location === "cz") ? "✓" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Location selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "#4a4a5a", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>LOKALITA:</span>
            <div style={{ display: "flex", gap: 0 }}>
              {locations.map((loc) => (
                <button key={loc.id} onClick={() => handleLocationChange(loc.id)} disabled={loading}
                  style={{
                    padding: "5px 14px", fontSize: 12, fontFamily: "'Space Mono', monospace",
                    background: location === loc.id ? "#00f0ff15" : "#12122a",
                    border: location === loc.id ? "1px solid #00f0ff44" : "1px solid #ffffff18",
                    color: location === loc.id ? "#00f0ff" : "#6a6a7a",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    borderRadius: loc.id === "cz" ? "8px 0 0 8px" : "0 8px 8px 0",
                    transition: "all 0.2s",
                    marginLeft: loc.id === "au" ? -1 : 0,
                  }}
                >
                  {loc.id === "cz" ? "🇨🇿 ČR" : "🇦🇺 AU"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div style={{ marginTop: 8, fontSize: 12, color: "#ff4444", fontFamily: "'Space Mono', monospace" }}>⚠ {error}</div>}
      </div>

      {/* Category Filter */}
      <div style={{ padding: "14px 28px", display: "flex", gap: 8, overflowX: "auto", borderBottom: "1px solid #ffffff06" }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => { setFilter(cat); setSelected(null); }}
            style={{
              padding: "5px 14px", borderRadius: 20,
              border: filter === cat ? "1px solid #00f0ff66" : "1px solid #ffffff10",
              background: filter === cat ? "#00f0ff12" : "transparent",
              color: filter === cat ? "#00f0ff" : "#6a6a7a",
              fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", height: "calc(100vh - 230px)" }}>
        {/* List */}
        <div style={{ width: selectedOpp ? "40%" : "100%", overflowY: "auto", transition: "width 0.3s ease" }}>
          {filtered.map((opp) => (
            <div key={opp.id} onClick={() => setSelected(opp.id === selected ? null : opp.id)}
              style={{
                padding: "16px 28px", borderBottom: "1px solid #ffffff06", cursor: "pointer",
                background: selected === opp.id ? "#0d0d20" : "transparent",
                transition: "all 0.2s", position: "relative",
              }}
              onMouseEnter={(e) => { if (selected !== opp.id) e.currentTarget.style.background = "#0a0a1a"; }}
              onMouseLeave={(e) => { if (selected !== opp.id) e.currentTarget.style.background = "transparent"; }}
            >
              {selected === opp.id && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: opp.categoryColor || "#00f0ff" }} />}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, fontWeight: 700, color: "#ffffff12", minWidth: 36, lineHeight: 1, paddingTop: 2 }}>
                  {opp.rank}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{categoryIcons[opp.category] || "📊"}</span>
                    <span style={{ fontSize: 10, color: opp.categoryColor || "#00f0ff", fontFamily: "'Space Mono', monospace", letterSpacing: 1, textTransform: "uppercase" }}>{opp.category}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 6px", color: "#e0e0e8" }}>{opp.title}</h3>
                  <p style={{ fontSize: 12, color: "#6a6a7a", margin: 0, lineHeight: 1.5, display: selectedOpp ? "none" : "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {opp.description}
                  </p>
                  {!selectedOpp && (
                    <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, flexWrap: "wrap" }}>
                      <Tooltip info={metricInfo.ev}><span style={{ color: "#6a6a7a" }}>EV: </span><span style={{ color: opp.expectedValue >= 85 ? "#00ff88" : opp.expectedValue >= 75 ? "#f0ff00" : "#ff8844", fontWeight: 600 }}>{opp.expectedValue}</span></Tooltip>
                      <Tooltip info={metricInfo.difficulty}><span style={{ color: "#6a6a7a" }}>Náročnost: </span><span style={{ color: "#8a8a9a" }}>{opp.difficulty}</span></Tooltip>
                      <Tooltip info={metricInfo.capital}><span style={{ color: "#6a6a7a" }}>Kapitál: </span><span style={{ color: "#8a8a9a" }}>{opp.capital}</span></Tooltip>
                      <Tooltip info={metricInfo.asymmetry}><span style={{ color: "#6a6a7a" }}>Asymetrie: </span><span style={{ color: opp.asymmetry === "Velmi vysoká" ? "#00ff88" : opp.asymmetry === "Vysoká" ? "#88ff44" : "#f0ff00" }}>{opp.asymmetry}</span></Tooltip>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%",
                    border: `2px solid ${opp.expectedValue >= 85 ? "#00ff8844" : opp.expectedValue >= 75 ? "#f0ff0044" : "#ff884444"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700,
                    color: opp.expectedValue >= 85 ? "#00ff88" : opp.expectedValue >= 75 ? "#f0ff00" : "#ff8844",
                  }}>
                    {opp.expectedValue}
                  </div>
                  <span style={{ fontSize: 9, color: "#4a4a5a", fontFamily: "'Space Mono', monospace" }}>EV</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selectedOpp && (
          <div style={{ width: "60%", overflowY: "auto", padding: "24px 28px", animation: "fadeIn 0.3s ease" }}>
            <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }`}</style>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{categoryIcons[selectedOpp.category] || "📊"}</span>
              <span style={{ fontSize: 11, color: selectedOpp.categoryColor || "#00f0ff", fontFamily: "'Space Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }}>{selectedOpp.category}</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>{selectedOpp.title}</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {(selectedOpp.tags || []).map((t) => <Tag key={t}>{t}</Tag>)}
            </div>

            {/* Metrics with tooltips */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              <div style={{ padding: 14, background: "#0d0d20", borderRadius: 10, border: "1px solid #ffffff08" }}>
                <BarChart value={selectedOpp.expectedValue} color="#00ff88" label="Očekávaná hodnota (EV)" />
                <BarChart value={selectedOpp.difficulty} color="#ff6b00" label="Náročnost realizace" />
              </div>
              <div style={{ padding: 14, background: "#0d0d20", borderRadius: 10, border: "1px solid #ffffff08", fontSize: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <Tooltip info={metricInfo.capital}><span style={{ color: "#6a6a7a" }}>Kapitál: </span></Tooltip>
                  <span style={{ fontWeight: 500 }}>{selectedOpp.capital}</span>
                </div>
                <div style={{ marginBottom: 8 }}><span style={{ color: "#6a6a7a" }}>Horizont: </span><span style={{ fontWeight: 500 }}>{selectedOpp.timeHorizon}</span></div>
                <div style={{ marginBottom: 8 }}>
                  <Tooltip info={metricInfo.asymmetry}><span style={{ color: "#6a6a7a" }}>Asymetrie: </span></Tooltip>
                  <span style={{ fontWeight: 500, color: selectedOpp.asymmetry === "Velmi vysoká" ? "#00ff88" : "#88ff44" }}>{selectedOpp.asymmetry}</span>
                </div>
                <div><span style={{ color: "#6a6a7a" }}>Konkurence: </span><span style={{ fontWeight: 500 }}>{selectedOpp.competition}</span></div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "#6a6a7a", textTransform: "uppercase", margin: "0 0 8px" }}>Analýza</h4>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#b0b0be", margin: 0 }}>{selectedOpp.description}</p>
            </div>

            <div style={{ marginBottom: 20, padding: 16, background: "linear-gradient(135deg, #ff6b0008, #ff6b0003)", borderRadius: 10, border: "1px solid #ff6b0020" }}>
              <h4 style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "#ff6b00", textTransform: "uppercase", margin: "0 0 8px" }}>🔍 Identifikovaná Neefektivita</h4>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#b0b0be", margin: 0 }}>{selectedOpp.inefficiency}</p>
            </div>

            <div style={{ marginBottom: 20, padding: 16, background: "linear-gradient(135deg, #00f0ff08, #00f0ff03)", borderRadius: 10, border: "1px solid #00f0ff20" }}>
              <h4 style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "#00f0ff", textTransform: "uppercase", margin: "0 0 8px" }}>{localRelevanceLabel}</h4>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#b0b0be", margin: 0 }}>{selectedOpp.czechRelevance || selectedOpp.localRelevance || "—"}</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 2, color: "#6a6a7a", textTransform: "uppercase", margin: "0 0 10px" }}>💰 Cesty k Monetizaci</h4>
              {(selectedOpp.monetization || []).map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < (selectedOpp.monetization || []).length - 1 ? "1px solid #ffffff06" : "none", fontSize: 13, color: "#b0b0be" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: `${selectedOpp.categoryColor || "#00f0ff"}15`, border: `1px solid ${selectedOpp.categoryColor || "#00f0ff"}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: selectedOpp.categoryColor || "#00f0ff", flexShrink: 0, fontFamily: "'Space Mono', monospace" }}>
                    {i + 1}
                  </span>
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metric Legend */}
      <div style={{
        position: "fixed", bottom: 28, left: 28, right: 28,
        display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap",
        padding: "6px 16px", background: "#0d0d20ee", borderRadius: 8,
        border: "1px solid #ffffff08", backdropFilter: "blur(10px)",
      }}>
        {Object.entries(metricInfo).map(([key, info]) => (
          <Tooltip key={key} info={info}>
            <span style={{ fontSize: 10, color: "#4a4a6a", fontFamily: "'Space Mono', monospace", letterSpacing: 0.5 }}>
              {info.label}
            </span>
          </Tooltip>
        ))}
        <span style={{ fontSize: 10, color: "#3a3a4a", fontFamily: "'Space Mono', monospace", marginLeft: "auto" }}>
          {months[month]} 2026 · {currentLocation?.label}
        </span>
      </div>
    </div>
  );
}
