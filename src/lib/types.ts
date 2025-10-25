export interface RequirementItem {
  itemId: string;
  quantity: number;
}

export interface Quest {
  id: string;
  name: string;
  trader: string;
  objectives: string[];
  requiredItemIds?: RequirementItem[];
  rewardItemIds?: RequirementItem[];
  xp: number;
  status?: "active" | "locked" | "completed";
  prerequisites?: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: "Ammunition" | "Medical" | "Components" | "Material" | "Weapon Mods" | "Power";
  rarity?: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  value?: number;
  weightKg?: number;
  imageFilename?: string;
}

export interface WorkstationLevel {
  level: number;
  requirementItemIds: RequirementItem[];
  prerequisites?: string[];
  otherRequirements?: string[];
}

export interface Workstation {
  id: string;
  name: string;
  description?: string;
  maxLevel: number;
  currentLevel?: number;
  levels: WorkstationLevel[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  impactedSkill: string;
  knownValue: any[];
  category: "CONDITIONING" | "MOBILITY" | "SURVIVAL";
  maxPoints: number;
  iconName: string;
  isMajor: boolean;
  position: {
    x: number;
    y: number;
  };
  prerequisiteNodeIds: string[];
}

export interface Tip {
  id: string;
  author: {
    name: string;
    avatar: string;
    reputation: number;
  };
  content: string;
  tags: string[];
  votes: number;
  datePosted: string | undefined;
}

export interface CalculatorSelection {
  quests: string[];
  upgrades: string[];
  customMaterials: RequirementItem[];
}

export interface MaterialRequirement {
  itemId: string;
  itemName: string;
  category: string;
  have: number;
  need: number;
  deficit: number;
}
