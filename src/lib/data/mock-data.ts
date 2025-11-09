import type { Quest, Item, Workstation, Tip } from "../types";

export const mockQuests: Quest[] = [
  {
    id: "m1",
    name: "Topside",
    trader: "Shani",
    objectives: ["Go topside for the first time", "Optional - Ping any ARC"],
    rewardItemIds: [
      { itemId: "ferro_i", quantity: 1 },
      { itemId: "heavy_ammo", quantity: 20 }
    ],
    xp: 4000,
    status: "completed"
  },
  {
    id: "m2",
    name: "The Bandage Run",
    trader: "Lance",
    objectives: ["Search 5 containers", "Get 15 pieces of Fabric for Lance"],
    requiredItemIds: [{ itemId: "fabric", quantity: 15 }],
    rewardItemIds: [{ itemId: "herbal_bandages", quantity: 3 }],
    xp: 4000,
    status: "active"
  },
  {
    id: "m3",
    name: "Heavy Metal",
    trader: "Shani",
    objectives: ["Defeat 5 Sentinels", "Return to Shani"],
    rewardItemIds: [{ itemId: "sentinel_core", quantity: 2 }],
    xp: 6000,
    status: "active"
  },
  {
    id: "m4",
    name: "Supply Drop",
    trader: "Marcus",
    objectives: ["Secure 3 supply drops", "Extract successfully"],
    xp: 5000,
    status: "locked",
    prerequisites: ["Complete The Bandage Run"]
  }
];

export const mockItems = [
  {
    id: "fabric",
    name: "Fabric",
    description: "A common crafting material.",
    type: "Material",
    rarity: "Common",
    imageFilename: "https://cdn.arctracker.io/items/fabric.png"
  },
  {
    id: "tick-pod",
    name: "Tick Pod",
    description: "The explosive pod from a Tick.",
    type: "Material",
    rarity: "Uncommon",
    imageFilename: "https://cdn.arctracker.io/items/tick_pod.png"
  },
  {
    id: "metal-parts",
    name: "Metal Parts",
    description: "Used to craft a wide range of items.",
    type: "Material",
    rarity: "Common",
    value: 75,
    weightKg: 0.15,
    imageFilename: "https://cdn.arctracker.io/items/metal_parts.png"
  },
  {
    id: "sentinel-core",
    name: "Sentinel Core",
    description: "Advanced component from defeated Sentinels.",
    type: "Components",
    rarity: "Epic",
    value: 500,
    weightKg: 0.5
  },
  {
    id: "herbal-bandages",
    name: "Herbal Bandages",
    description: "Basic healing item.",
    type: "Medical",
    rarity: "Common",
    value: 50,
    weightKg: 0.1
  }
];


export const mockTips: Tip[] = [
  {
    id: "tip1",
    author: {
      name: "RaiderPro",
      avatar: "",
      reputation: 1250
    },
    content: "Always check the perimeter before engaging Sentinels. They often patrol in pairs, and getting caught between two is a death sentence.",
    tags: ["Combat", "Sentinels", "Strategy"],
    votes: 45,
    datePosted: "2024-01-15"
  },
  {
    id: "tip2",
    author: {
      name: "LootMaster",
      avatar: "",
      reputation: 890
    },
    content: "The Bandage Run quest is much easier if you focus on medical crates. They have a higher chance of containing Fabric.",
    tags: ["The Bandage Run", "Quests", "Looting"],
    votes: 32,
    datePosted: "2024-01-14"
  },
  {
    id: "tip3",
    author: {
      name: "TechSavvy",
      avatar: "",
      reputation: 2100
    },
    content: "Prioritize upgrading your Weapon Bench first. Better weapons make all other quests significantly easier.",
    tags: ["Workstations", "Progression", "Tips"],
    votes: 67,
    datePosted: "2024-01-13"
  }
];

// Helper functions
export const getQuestById = (id: string): Quest | undefined => {
  return mockQuests.find(q => q.id === id);
};
