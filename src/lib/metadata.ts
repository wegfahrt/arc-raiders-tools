import { type Metadata } from "next";

export const siteConfig = {
  name: "ArcDéx",
  url: "https://arcdex.app", // Update with your actual domain
  ogImage: "/og-image.jpg", // Placeholder for future use
  description: "Comprehensive companion app for Arc Raiders - Track quests, browse items, optimize recycling, manage workstations, and calculate materials.",
  keywords: [
    // Core Brand
    "Arc Raiders",
    "ArcDéx",
    "Arc Raiders companion app",
    "Arc Raiders tools",
    "Arc Raiders helper",
    
    // Features
    "Arc Raiders quest tracker",
    "Arc Raiders item database",
    "Arc Raiders recycling calculator",
    "Arc Raiders workstation guide",
    "Arc Raiders material calculator",
    "Arc Raiders hideout upgrades",
    
    // Gameplay Systems
    "Arc Raiders quests",
    "Arc Raiders missions",
    "Arc Raiders crafting",
    "Arc Raiders materials",
    "Arc Raiders progression",
    "Arc Raiders loot",
    
    // Generic
    "quest tracker",
    "item database",
    "material calculator",
    "recycling optimizer",
    "game companion",
  ],
};

export const germanSiteConfig = {
  name: "ArcDéx",
  description: "Umfassende Begleit-App für Arc Raiders - Quests verfolgen, Items durchsuchen, Recycling optimieren, Werkstätten verwalten und Materialien berechnen.",
  keywords: [
    "Arc Raiders",
    "ArcDéx",
    "Arc Raiders Begleit-App",
    "Arc Raiders Werkzeuge",
    "Arc Raiders Hilfe",
    "Arc Raiders Quest-Tracker",
    "Arc Raiders Item-Datenbank",
    "Arc Raiders Recycling-Rechner",
    "Arc Raiders Werkstätten",
    "Arc Raiders Material-Rechner",
    "Arc Raiders Versteck-Upgrades",
    "Arc Raiders Quests",
    "Arc Raiders Missionen",
    "Arc Raiders Crafting",
    "Arc Raiders Materialien",
    "Arc Raiders Fortschritt",
  ],
};

interface PageMetadataConfig {
  title: string;
  description: string;
  keywords: string[];
  titleDe?: string;
  descriptionDe?: string;
  keywordsDe?: string[];
}

export const pageMetadata: Record<string, PageMetadataConfig> = {
  home: {
    title: "ArcDéx - Dashboard",
    description: "Track your Arc Raiders progress with the ultimate companion dashboard. Monitor quest completion, active missions, workstation upgrades, and material shortages in one place.",
    keywords: [
      "Arc Raiders dashboard",
      "Arc Raiders progress tracker",
      "Arc Raiders companion",
      "Arc Raiders overview",
      "quest progress",
      "workstation progress",
      "mission tracker",
    ],
    titleDe: "ArcDéx - Dashboard",
    descriptionDe: "Verfolge deinen Arc Raiders Fortschritt mit dem ultimativen Begleit-Dashboard. Überwache Quest-Abschlüsse, aktive Missionen, Werkstatt-Upgrades und Materialengpässe an einem Ort.",
    keywordsDe: [
      "Arc Raiders Dashboard",
      "Arc Raiders Fortschritt",
      "Arc Raiders Begleiter",
      "Arc Raiders Übersicht",
      "Quest-Fortschritt",
      "Werkstatt-Fortschritt",
    ],
  },
  
  items: {
    title: "Items",
    description: "Browse the complete Arc Raiders item database with 200+ items. Filter by type, rarity, and loot area. Search weapons, armor, materials, consumables, and more with detailed stats and crafting recipes.",
    keywords: [
      "Arc Raiders items",
      "Arc Raiders item database",
      "Arc Raiders weapons",
      "Arc Raiders armor",
      "Arc Raiders materials",
      "Arc Raiders loot guide",
      "item list",
      "crafting recipes",
      "item stats",
      "loot locations",
      "item rarity",
    ],
    titleDe: "Items",
    descriptionDe: "Durchsuche die vollständige Arc Raiders Item-Datenbank mit über 200 Items. Filtere nach Typ, Seltenheit und Fundort. Suche Waffen, Rüstungen, Materialien, Verbrauchsgüter und mehr mit detaillierten Stats und Crafting-Rezepten.",
    keywordsDe: [
      "Arc Raiders Items",
      "Arc Raiders Item-Datenbank",
      "Arc Raiders Waffen",
      "Arc Raiders Rüstungen",
      "Arc Raiders Materialien",
      "Arc Raiders Loot-Guide",
      "Item-Liste",
      "Crafting-Rezepte",
    ],
  },
  
  quests: {
    title: "Quests",
    description: "Complete Arc Raiders quest tracker with visual flowchart. Track quest dependencies, prerequisites, rewards, and turn-in requirements. View quest chains from traders like Shani, Lance, and Marcus.",
    keywords: [
      "Arc Raiders quests",
      "Arc Raiders quest tracker",
      "Arc Raiders missions",
      "quest dependencies",
      "quest chain",
      "quest flowchart",
      "quest prerequisites",
      "quest rewards",
      "mission guide",
      "trader quests",
      "quest completion",
    ],
    titleDe: "Quests",
    descriptionDe: "Vollständiger Arc Raiders Quest-Tracker mit visuellem Flowchart. Verfolge Quest-Abhängigkeiten, Voraussetzungen, Belohnungen und Abgabe-Anforderungen. Zeige Quest-Ketten von Händlern wie Shani, Lance und Marcus an.",
    keywordsDe: [
      "Arc Raiders Quests",
      "Arc Raiders Quest-Tracker",
      "Arc Raiders Missionen",
      "Quest-Abhängigkeiten",
      "Quest-Kette",
      "Quest-Flowchart",
      "Quest-Belohnungen",
    ],
  },
  
  recycling: {
    title: "Recycling",
    description: "Optimize Arc Raiders recycling chains with advanced calculator. Find reverse recycling paths, terminal materials, and efficiency scores. Visualize multi-step recycling chains and maximize resource value.",
    keywords: [
      "Arc Raiders recycling",
      "Arc Raiders recycling calculator",
      "recycling chains",
      "terminal materials",
      "recycling optimizer",
      "resource efficiency",
      "material breakdown",
      "recycling paths",
      "salvage calculator",
      "item recycling",
    ],
    titleDe: "Recycling",
    descriptionDe: "Optimiere Arc Raiders Recycling-Ketten mit fortgeschrittenem Rechner. Finde umgekehrte Recycling-Pfade, Terminal-Materialien und Effizienz-Scores. Visualisiere mehrstufige Recycling-Ketten und maximiere Ressourcenwert.",
    keywordsDe: [
      "Arc Raiders Recycling",
      "Arc Raiders Recycling-Rechner",
      "Recycling-Ketten",
      "Terminal-Materialien",
      "Recycling-Optimierer",
      "Ressourcen-Effizienz",
    ],
  },
  
  workstations: {
    title: "Workstations",
    description: "Track Arc Raiders hideout workstation upgrades. View weapon bench, equipment bench, explosives bench, med station, refiner, and more. See upgrade requirements, material costs, and progression paths.",
    keywords: [
      "Arc Raiders workstations",
      "Arc Raiders hideout",
      "hideout upgrades",
      "workstation guide",
      "weapon bench",
      "equipment bench",
      "crafting stations",
      "upgrade requirements",
      "hideout progression",
      "crafting bench",
      "station levels",
    ],
    titleDe: "Werkstätten",
    descriptionDe: "Verfolge Arc Raiders Versteck-Werkstatt-Upgrades. Zeige Waffenbank, Ausrüstungsbank, Sprengstoffbank, Krankenstation, Raffinerie und mehr an. Siehe Upgrade-Anforderungen, Materialkosten und Fortschrittspfade.",
    keywordsDe: [
      "Arc Raiders Werkstätten",
      "Arc Raiders Versteck",
      "Versteck-Upgrades",
      "Werkstatt-Guide",
      "Waffenbank",
      "Ausrüstungsbank",
      "Crafting-Stationen",
    ],
  },
  
  calculator: {
    title: "Calculator",
    description: "Calculate Arc Raiders material requirements across quests, workstations, and projects. Aggregate resources, track inventory, and plan your material farming with the ultimate crafting calculator.",
    keywords: [
      "Arc Raiders calculator",
      "Arc Raiders material calculator",
      "resource calculator",
      "crafting calculator",
      "material planner",
      "inventory manager",
      "resource planner",
      "material requirements",
      "aggregate calculator",
      "farming guide",
    ],
    titleDe: "Rechner",
    descriptionDe: "Berechne Arc Raiders Material-Anforderungen über Quests, Werkstätten und Projekte hinweg. Aggregiere Ressourcen, verfolge Inventar und plane dein Material-Farming mit dem ultimativen Crafting-Rechner.",
    keywordsDe: [
      "Arc Raiders Rechner",
      "Arc Raiders Material-Rechner",
      "Ressourcen-Rechner",
      "Crafting-Rechner",
      "Material-Planer",
      "Inventar-Manager",
    ],
  },
  
  guides: {
    title: "Guides",
    description: "Community-driven Arc Raiders tips, strategies, and guides. Learn combat tactics, Sentinel strategies, looting tips, quest walkthroughs, and progression advice from experienced players.",
    keywords: [
      "Arc Raiders guides",
      "Arc Raiders tips",
      "Arc Raiders strategies",
      "Arc Raiders tactics",
      "combat guide",
      "Sentinel tactics",
      "looting guide",
      "quest walkthrough",
      "progression guide",
      "community tips",
      "gameplay strategies",
    ],
    titleDe: "Guides",
    descriptionDe: "Community-gesteuerte Arc Raiders Tipps, Strategien und Guides. Lerne Kampftaktiken, Sentinel-Strategien, Loot-Tipps, Quest-Walkthroughs und Fortschritts-Ratschläge von erfahrenen Spielern.",
    keywordsDe: [
      "Arc Raiders Guides",
      "Arc Raiders Tipps",
      "Arc Raiders Strategien",
      "Arc Raiders Taktiken",
      "Kampf-Guide",
      "Sentinel-Taktiken",
      "Loot-Guide",
    ],
  },
  
  maps: {
    title: "Maps",
    description: "Interactive Arc Raiders maps with loot locations, extraction points, and tactical information. Navigate the game world with detailed map markers and strategic points of interest. (Coming Soon)",
    keywords: [
      "Arc Raiders maps",
      "Arc Raiders interactive maps",
      "loot locations",
      "extraction points",
      "map markers",
      "tactical map",
      "game map",
    ],
    titleDe: "Karten",
    descriptionDe: "Interaktive Arc Raiders Karten mit Loot-Standorten, Extraktionspunkten und taktischen Informationen. Navigiere durch die Spielwelt mit detaillierten Karten-Markierungen. (Demnächst)",
    keywordsDe: [
      "Arc Raiders Karten",
      "Arc Raiders interaktive Karten",
      "Loot-Standorte",
      "Extraktionspunkte",
      "Karten-Markierungen",
    ],
  },
};

export function generateMetadata(page: keyof typeof pageMetadata, locale: "en" | "de" = "en"): Metadata {
  const config = pageMetadata[page];
  if (!config) {
    throw new Error(`Page metadata not found for: ${page}`);
  }
  
  const isGerman = locale === "de";
  
  const title = isGerman && config.titleDe ? config.titleDe : config.title;
  const description = isGerman && config.descriptionDe ? config.descriptionDe : config.description;
  const keywords = isGerman && config.keywordsDe 
    ? [...config.keywordsDe, ...germanSiteConfig.keywords]
    : [...config.keywords, ...siteConfig.keywords];
  
  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "ArcDéx Team" }],
    creator: "ArcDéx",
    publisher: "ArcDéx",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: "/",
      languages: {
        "en": "/",
        "de": "/", // Update when locale routing is implemented
      },
    },
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      locale: isGerman ? "de_DE" : "en_US",
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
      creator: "@arcdex", // Update with actual Twitter handle
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
