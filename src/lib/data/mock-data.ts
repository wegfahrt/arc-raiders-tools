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

export const mockWorkstations: Workstation[] = [
  {
    id: "scrappy",
    name: "Scrappy",
    description: "Your loyal companion that helps gather resources.",
    maxLevel: 6,
    currentLevel: 2,
    levels: [
      { level: 1, requirementItemIds: [] },
      { 
        level: 2, 
        requirementItemIds: [
          { itemId: "dog_collar", quantity: 1 }, 
          { itemId: "torn_blanket", quantity: 1 }
        ] 
      },
      { 
        level: 3, 
        requirementItemIds: [
          { itemId: "lemon", quantity: 5 }, 
          { itemId: "apricot", quantity: 5 }
        ] 
      },
      { 
        level: 4, 
        requirementItemIds: [
          { itemId: "prickly_pear", quantity: 8 }, 
          { itemId: "olives", quantity: 8 }, 
          { itemId: "cat_bed", quantity: 1 }
        ] 
      },
      { 
        level: 5, 
        requirementItemIds: [
          { itemId: "apricots", quantity: 12 }, 
          { itemId: "mushrooms", quantity: 12 }, 
          { itemId: "very_comfortable_pillow", quantity: 3 }
        ] 
      },
      { 
        level: 6, 
        requirementItemIds: [{ itemId: "unknown_item", quantity: 99 }],
        prerequisites: ["Unknown at this time"] 
      }
    ]
  },
  {
    id: "weapon_bench",
    name: "Weapon Bench",
    description: "Upgrade and maintain your weapons.",
    maxLevel: 3,
    currentLevel: 1,
    levels: [
      { 
        level: 1, 
        requirementItemIds: [
          { itemId: "metal_parts", quantity: 20 }, 
          { itemId: "rubber_parts", quantity: 30 }
        ],
        otherRequirements: ["3x Raids"]
      },
      { 
        level: 2, 
        requirementItemIds: [
          { itemId: "rusted_tools", quantity: 3 }, 
          { itemId: "mechanical_components", quantity: 3 }, 
          { itemId: "wasp_driver", quantity: 8 }
        ] 
      },
      { 
        level: 3, 
        requirementItemIds: [
          { itemId: "rusted_gear", quantity: 5 }, 
          { itemId: "advanced_mechanical_components", quantity: 3 }, 
          { itemId: "sentinel_core", quantity: 3 }
        ] 
      }
    ]
  },
  {
    id: "armor_station",
    name: "Armor Station",
    description: "Craft and upgrade protective gear.",
    maxLevel: 3,
    currentLevel: 0,
    levels: [
      { 
        level: 1, 
        requirementItemIds: [
          { itemId: "fabric", quantity: 50 }, 
          { itemId: "metal_parts", quantity: 15 }
        ] 
      },
      { 
        level: 2, 
        requirementItemIds: [
          { itemId: "reinforced_fabric", quantity: 30 }, 
          { itemId: "carbon_fiber", quantity: 10 }
        ] 
      },
      { 
        level: 3, 
        requirementItemIds: [
          { itemId: "nanoweave", quantity: 20 }, 
          { itemId: "titan_alloy", quantity: 5 }
        ] 
      }
    ]
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

// export const getItemById = (id: string): Item | undefined => {
//   return mockItems.find(i => i.id === id);
// };

export const getWorkstationById = (id: string): Workstation | undefined => {
  return mockWorkstations.find(w => w.id === id);
};
