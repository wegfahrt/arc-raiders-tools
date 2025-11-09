// Multi-language support for translated fields
export interface LocalizedText {
  en: string;
  de?: string;
  fr?: string;
  es?: string;
  pt?: string;
  pl?: string;
  no?: string;
  da?: string;
  it?: string;
  ru?: string;
  ja?: string;
  "zh-TW"?: string;
  uk?: string;
  "zh-CN"?: string;
  kr?: string;
  tr?: string;
  hr?: string;
  sr?: string;
}

// Alias for backwards compatibility
export type TranslatedText = LocalizedText;

// ============================================================================
// ITEM TYPES (Updated to match GitHub data structure)
// ============================================================================

/**
 * Recipe for crafting, recycling, or salvaging
 * Maps material ID to quantity needed
 */
export interface MaterialRecipe {
  [materialId: string]: number;
}

/**
 * Effect with localized description and value
 */
export interface Effect {
  en: string;
  de: string;
  fr: string;
  es: string;
  pt: string;
  pl: string;
  no: string;
  da: string;
  it: string;
  ru: string;
  ja: string;
  "zh-TW": string;
  uk: string;
  "zh-CN": string;
  kr: string;
  tr: string;
  hr: string;
  sr: string;
  value: string | number;
}

/**
 * Item type categories
 */
export type ItemType = 
  | "Material"
  | "Consumable"
  | "Weapon"
  | "Armor"
  | "Tool"
  | "Quest"
  | "Ammo"
  | "Container"
  | string; // Allow other types

/**
 * Item rarity levels
 */
export type ItemRarity = 
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Epic"
  | "Legendary"
  | string; // Allow other rarities

/**
 * Main Item interface matching GitHub data structure
 */
export interface Item {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  imageFilename: string;
  recyclesInto: MaterialRecipe | null;
  weightKg: string | null;
  stackSize: number | null;
  foundIn: string | null;
  effects: {
    [effectName: string]: Effect;
  } | null;
  salvagesInto: MaterialRecipe | null;
  tip: string | null;
  recipe: MaterialRecipe | null;
  craftBench: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Database Item (as stored in Supabase/Drizzle)
 */
export interface DbItem {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  type: string;
  rarity: string;
  value: number;
  imageFilename: string;
  weightKg: string | null; // numeric type in DB
  stackSize: number | null;
  foundIn: string | null;
  tip: string | null;
  craftBench: string | null;
  recyclesInto: MaterialRecipe | null;
  salvagesInto: MaterialRecipe | null;
  recipe: MaterialRecipe | null;
  effects: { [effectName: string]: Effect } | null;
  createdAt: string;
  updatedAt: string | null;
}

/**
 * Item with computed/aggregated fields
 */
export interface ItemWithUsage extends Item {
  questsRequired: number;
  hideoutRequired: number;
  projectRequired: number;
  totalRequired: number;
}

// ============================================================================
// QUEST TYPES
// ============================================================================

export interface RequirementItem {
  itemId: string;
  quantity: number;
  moduleId: string;
  level: number;
  item: Item;
}

export interface Quest {
  id: string;
  name: string | TranslatedText;
  trader: string;
  objectives: string[];
  requiredItemIds?: RequirementItem[];
  rewardItemIds?: RequirementItem[];
  xp: number;
  status?: "active" | "locked" | "completed";
  prerequisites?: string[];
}

// ============================================================================
// HIDEOUT/WORKSTATION TYPES
// ============================================================================

export interface WorkstationLevel {
  level: number;
  moduleId: string;
  otherRequirements: string[] | null;
  requirements: RequirementItem[];
}

export interface Workstation {
  id: string;
  name: LocalizedText;
  maxLevel: number;
  createdAt: string | null;
  updatedAt: string | null;
  currentLevel?: number;
  levels: WorkstationLevel[];
}

// ============================================================================
// SKILL TYPES
// ============================================================================

export interface Skill {
  id: string;
  name: string | TranslatedText;
  description: string | TranslatedText;
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

// ============================================================================
// PROJECT TYPES
// ============================================================================

/**
 * Category requirement for a project phase
 */
export interface CategoryRequirement {
  category: string;
  valueRequired: number;
}

/**
 * A single phase within a project
 */
export interface ProjectPhase {
  phase: number;
  name: TranslatedText;
  description?: TranslatedText;
  requirementItemIds?: RequirementItem[];
  requirementCategories?: CategoryRequirement[];
}

/**
 * Main project entity
 */
export interface Project {
  id: string;
  name: TranslatedText;
  description: TranslatedText;
  phases: ProjectPhase[];
}

/**
 * Database types for projects
 */
export interface DbProject {
  id: string;
  name: TranslatedText;
  description: TranslatedText;
  createdAt: string;
  updatedAt: string;
}

export interface DbProjectPhase {
  id: number;
  projectId: string;
  phase: number;
  name: TranslatedText;
  description: TranslatedText | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbPhaseItemRequirement {
  id: number;
  projectId: string;
  phase: number;
  itemId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbPhaseCategoryRequirement {
  id: number;
  projectId: string;
  phase: number;
  category: string;
  valueRequired: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project with all related data
 */
export interface ProjectWithPhases extends DbProject {
  phases: (DbProjectPhase & {
    itemRequirements: (DbPhaseItemRequirement & {
      item?: Item;
    })[];
    categoryRequirements: DbPhaseCategoryRequirement[];
  })[];
}

/**
 * Material aggregation across all projects
 */
export interface ProjectMaterialSummary {
  itemId: string;
  itemName: TranslatedText;
  totalQuantity: number;
  phaseBreakdown: {
    projectId: string;
    projectName: TranslatedText;
    phase: number;
    phaseName: TranslatedText;
    quantity: number;
  }[];
}

/**
 * Category requirement summary for a phase
 */
export interface PhaseCategorySummary {
  projectId: string;
  phase: number;
  categories: {
    category: string;
    valueRequired: number;
    valueFulfilled?: number;
    progress?: number;
  }[];
  totalValueRequired: number;
  totalValueFulfilled?: number;
  overallProgress?: number;
}

// ============================================================================
// CALCULATOR & MATERIAL TRACKING
// ============================================================================

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

/**
 * Material usage view
 */
export interface MaterialUsage {
  id: string;
  name: TranslatedText;
  type: string;
  questRequired: number;
  hideoutRequired: number;
  projectRequired: number;
  totalRequired: number;
}

/**
 * Shopping list item
 */
export interface ProjectShoppingListItem {
  itemId: string;
  itemName: TranslatedText;
  itemType: string;
  itemValue: number | null;
  requiredQuantity: number;
  ownedQuantity: number;
  neededQuantity: number;
  estimatedCost: number | null;
  usedInPhases: {
    projectId: string;
    phase: number;
    quantity: number;
  }[];
}

// ============================================================================
// CRAFTING & RECIPES
// ============================================================================

/**
 * Crafting recipe with all materials needed
 */
export interface CraftingRecipe {
  itemId: string;
  itemName: LocalizedText;
  craftBench: string | null;
  materials: {
    materialId: string;
    materialName: LocalizedText;
    quantity: number;
    have?: number;
    need?: number;
  }[];
  totalCost: number;
}

/**
 * Recycling result
 */
export interface RecyclingResult {
  itemId: string;
  itemName: LocalizedText;
  materials: {
    materialId: string;
    materialName: LocalizedText;
    quantity: number;
  }[];
  totalValue: number;
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * User progress tracking for projects
 */
export interface UserProjectProgress {
  userId: string;
  projectId: string;
  currentPhase: number;
  completedPhases: number[];
  itemsContributed: Record<string, number>;
  categoriesContributed: Record<string, number>;
  lastUpdated: string;
}

/**
 * Phase completion status
 */
export interface PhaseCompletionStatus {
  phase: number;
  isComplete: boolean;
  itemProgress: {
    itemId: string;
    required: number;
    current: number;
    percentage: number;
  }[];
  categoryProgress: {
    category: string;
    required: number;
    current: number;
    percentage: number;
  }[];
  overallProgress: number;
}

/**
 * Full project progress
 */
export interface ProjectProgress {
  projectId: string;
  projectName: TranslatedText;
  currentPhase: number;
  totalPhases: number;
  phases: PhaseCompletionStatus[];
  overallProgress: number;
  isComplete: boolean;
}

// ============================================================================
// SYNC METADATA
// ============================================================================

/**
 * Sync metadata
 */
export interface SyncMetadata {
  id: string;
  syncedAt: string | null;
  itemsCount: number | null;
  questsCount: number | null;
  skillsCount: number | null;
  modulesCount: number | null;
  projectsCount: number | null;
}

// ============================================================================
// TIPS & COMMUNITY
// ============================================================================

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

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

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

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface ItemFilters {
  type?: ItemType | ItemType[];
  rarity?: ItemRarity | ItemRarity[];
  minValue?: number;
  maxValue?: number;
  craftable?: boolean;
  recyclable?: boolean;
  salvageable?: boolean;
  hasEffects?: boolean;
  craftBench?: string;
  foundIn?: string;
  search?: string;
}

export interface ItemSortOptions {
  field: "name" | "value" | "rarity" | "type" | "updatedAt";
  direction: "asc" | "desc";
  locale?: string; // For sorting localized names
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Recipe with item details populated
 */
export interface PopulatedRecipe {
  [itemId: string]: {
    quantity: number;
    item: Item;
  };
}

/**
 * Effect with item context
 */
export interface ItemEffect {
  itemId: string;
  itemName: LocalizedText;
  effectName: string;
  effect: Effect;
}

/**
 * Loot location
 */
export interface LootLocation {
  location: string;
  items: {
    itemId: string;
    itemName: LocalizedText;
    rarity: ItemRarity;
  }[];
}

/**
 * Craft bench with items
 */
export interface CraftBenchWithItems {
  craftBench: string;
  items: {
    itemId: string;
    itemName: LocalizedText;
    recipe: MaterialRecipe;
  }[];
}
