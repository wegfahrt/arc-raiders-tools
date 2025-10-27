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

// Metaforge Item Types and Interfaces

export interface StatBlock {
  range: number;
  damage: number;
  health?: number;
  radius: number;
  shield: number;
  weight: number;
  agility: number;
  arcStun: number;
  healing: number;
  stamina: number;
  stealth: number;
  useTime: number;
  duration: number;
  fireRate: number;
  stability: number;
  stackSize: number;
  damageMult: number;
  raiderStun: number;
  weightLimit: number;
  magazineSize?: number;
  reducedNoise?: number;
  shieldCharge: number;
  backpackSlots: number;
  quickUseSlots: number;
  damagePerSecond: number;
  movementPenalty: number;
  safePocketSlots: number;
  damageMitigation: number;
  healingPerSecond: number;
  reducedEquipTime: number;
  staminaPerSecond: number;
  increasedADSSpeed: number;
  increasedFireRate: number;
  reducedReloadTime: number;
  illuminationRadius?: number;
  increasedEquipTime?: number;
  reducedUnequipTime: number;
  shieldCompatibility: string;
  increasedUnequipTime?: number;
  reducedVerticalRecoil: number;
  increasedBulletVelocity?: number;
  increasedVerticalRecoil: number;
  reducedMaxShotDispersion?: number;
  reducedPerShotDispersion?: number;
  reducedDurabilityBurnRate: number;
  reducedRecoilRecoveryTime?: number;
  increasedRecoilRecoveryTime: number;
  reducedDispersionRecoveryTime?: number;
}

export type ItemType = 
  | "Recyclable"
  | "Quick Use"
  | "Misc"
  | "Refined Material"
  | "Blueprint"
  | "Advanced Material"
  | "Weapon"
  | "Gadget"
  | "Topside Material";

export type Rarity = 
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary";

export interface Item {
  id: string;
  name: string;
  description: string;
  item_type: ItemType;
  loadout_slots: string[];
  icon: string;
  rarity: Rarity;
  value: number | null;
  workbench: string | null;
  stat_block: StatBlock;
  flavor_text: string | null;
  subcategory: string | null;
  created_at: string;
  updated_at: string;
  shield_type: string | null;
  loot_area: string | null;
  sources: any | null;
  ammo_type: string | null;
  locations: any[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ItemsResponse {
  data: Item[];
  pagination: Pagination;
}
