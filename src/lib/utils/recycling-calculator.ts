import type { Item, MaterialRecipe } from "../types";

/**
 * Recycling calculation utilities
 * All calculations are performed client-side using the item's recyclesInto data
 */

/**
 * Calculate the maximum depth of a recycling chain for an item
 * Returns 0 for terminal materials (cannot be recycled further)
 */
export function calculateRecyclingDepth(itemId: string, items: Item[]): number {
  const item = items.find((i) => i.id === itemId);
  if (!item?.recyclesInto || Object.keys(item.recyclesInto).length === 0) {
    return 0; // Terminal material
  }

  const childDepths = Object.keys(item.recyclesInto).map((childId) =>
    calculateRecyclingDepth(childId, items)
  );

  return 1 + Math.max(...childDepths, 0);
}

/**
 * Check if an item is a terminal material (cannot be recycled further)
 */
export function isTerminalMaterial(itemId: string, items: Item[]): boolean {
  const item = items.find((i) => i.id === itemId);
  return !item?.recyclesInto || Object.keys(item.recyclesInto).length === 0;
}

/**
 * Calculate recycling efficiency as a percentage of value retained
 * Returns 0-100, where 100% means no value loss
 */
export function calculateRecyclingEfficiency(
  itemId: string,
  items: Item[]
): number {
  const item = items.find((i) => i.id === itemId);
  if (!item || !item.recyclesInto) return 0;

  const inputValue = item.value || 0;
  if (inputValue === 0) return 0;

  const outputValue = Object.entries(item.recyclesInto).reduce(
    (sum, [materialId, qty]) => {
      const material = items.find((i) => i.id === materialId);
      return sum + (material?.value || 0) * qty;
    },
    0
  );

  return Math.round((outputValue / inputValue) * 100);
}

/**
 * Calculate the total value that can be obtained from recycling an item
 */
export function calculateTotalValue(itemId: string, items: Item[]): number {
  const item = items.find((i) => i.id === itemId);
  if (!item?.recyclesInto) return item?.value || 0;

  return Object.entries(item.recyclesInto).reduce(
    (sum, [materialId, qty]) => {
      const material = items.find((i) => i.id === materialId);
      return sum + (material?.value || 0) * qty;
    },
    0
  );
}

/**
 * Recursively build the complete recycling chain tree for an item
 */
export interface RecyclingNode {
  item: Item;
  produces: MaterialRecipe;
  children: RecyclingNode[];
  depth: number;
  quantity: number;
  path: string; // Unique path identifier for this node in the tree
}

export function buildRecyclingChain(
  itemId: string,
  items: Item[],
  depth = 0,
  quantity = 1,
  parentPath = ""
): RecyclingNode | null {
  const item = items.find((i) => i.id === itemId);
  if (!item) return null;

  const produces = item.recyclesInto || {};
  const children: RecyclingNode[] = [];
  const currentPath = parentPath ? `${parentPath}-${itemId}` : itemId;

  // Recursively build children
  if (produces && Object.keys(produces).length > 0) {
    let childIndex = 0;
    for (const [childId, childQty] of Object.entries(produces)) {
      const childNode = buildRecyclingChain(
        childId,
        items,
        depth + 1,
        childQty * quantity,
        `${currentPath}[${childIndex}]`
      );
      if (childNode) {
        children.push(childNode);
      }
      childIndex++;
    }
  }

  return {
    item,
    produces,
    children,
    depth,
    quantity,
    path: currentPath,
  };
}

/**
 * Get all terminal materials produced by recycling an item completely
 * Returns a map of material ID to total quantity obtained
 */
export function getTerminalMaterials(
  itemId: string,
  items: Item[],
  quantity = 1
): Record<string, number> {
  const chain = buildRecyclingChain(itemId, items, 0, quantity);
  if (!chain) return {};

  const terminals: Record<string, number> = {};

  function collectTerminals(node: RecyclingNode) {
    // If this node has no children, it's a terminal material
    if (node.children.length === 0) {
      terminals[node.item.id] = (terminals[node.item.id] || 0) + node.quantity;
    } else {
      // Otherwise, recurse through children
      node.children.forEach((child) => collectTerminals(child));
    }
  }

  collectTerminals(chain);
  return terminals;
}

/**
 * Represents a single step in a recycling path
 */
export interface RecyclingStep {
  input: Item;
  outputs: MaterialRecipe;
  stepNumber: number;
}

/**
 * Represents a complete path from a source item to a target material
 */
export interface RecyclingPath {
  sourceItem: Item;
  targetMaterial: Item;
  steps: RecyclingStep[];
  totalSteps: number;
  efficiency: number;
  finalQuantity: number;
  totalValueCost: number;
}

/**
 * Find all paths that produce a specific material through recycling
 * Includes both direct (1-step) and indirect (multi-step) paths
 */
export function findReverseRecyclingPaths(
  targetMaterialId: string,
  items: Item[],
  maxDepth = 10
): RecyclingPath[] {
  const paths: RecyclingPath[] = [];
  const targetMaterial = items.find((i) => i.id === targetMaterialId);
  if (!targetMaterial) return paths;

  // Find all items that can be recycled
  const recyclableItems = items.filter(
    (item) => item.recyclesInto && Object.keys(item.recyclesInto).length > 0
  );

  // For each recyclable item, check if it eventually produces the target material
  for (const sourceItem of recyclableItems) {
    const pathsFromSource = findPathsToMaterial(
      sourceItem,
      targetMaterialId,
      items,
      [],
      1,
      maxDepth
    );
    paths.push(...pathsFromSource);
  }

  return paths;
}

/**
 * Recursively find all paths from a source item to a target material
 */
function findPathsToMaterial(
  currentItem: Item,
  targetMaterialId: string,
  items: Item[],
  currentSteps: RecyclingStep[],
  currentQuantity: number,
  maxDepth: number
): RecyclingPath[] {
  // Prevent infinite recursion
  if (currentSteps.length >= maxDepth) return [];
  
  // Check if we've visited this item already in this path (circular dependency)
  if (currentSteps.some(step => step.input.id === currentItem.id)) return [];

  const paths: RecyclingPath[] = [];
  const produces = currentItem.recyclesInto || {};

  // Check if current item directly produces the target material
  if (produces[targetMaterialId]) {
    const targetMaterial = items.find((i) => i.id === targetMaterialId);
    if (targetMaterial) {
      const newSteps: RecyclingStep[] = [
        ...currentSteps,
        {
          input: currentItem,
          outputs: produces,
          stepNumber: currentSteps.length + 1,
        },
      ];

      const sourceItem = currentSteps[0]?.input || currentItem;
      const finalQuantity = produces[targetMaterialId]! * currentQuantity;

      // Calculate efficiency based on final output vs initial input
      const inputValue = sourceItem.value || 0;
      const outputValue = (targetMaterial.value || 0) * finalQuantity;
      const pathEfficiency = inputValue > 0 ? Math.round((outputValue / inputValue) * 100) : 0;

      paths.push({
        sourceItem,
        targetMaterial,
        steps: newSteps,
        totalSteps: newSteps.length,
        efficiency: pathEfficiency,
        finalQuantity,
        totalValueCost: sourceItem.value || 0,
      });
    }
  }

  // Recursively check materials produced by this item
  for (const [materialId, qty] of Object.entries(produces)) {
    const material = items.find((i) => i.id === materialId);
    if (material && material.recyclesInto) {
      const newSteps: RecyclingStep[] = [
        ...currentSteps,
        {
          input: currentItem,
          outputs: produces,
          stepNumber: currentSteps.length + 1,
        },
      ];

      const subPaths = findPathsToMaterial(
        material,
        targetMaterialId,
        items,
        newSteps,
        currentQuantity * qty,
        maxDepth
      );

      paths.push(...subPaths);
    }
  }

  return paths;
}

/**
 * Calculate comprehensive metrics for an item
 */
export interface RecyclingMetrics {
  depth: number;
  efficiency: number;
  isTerminal: boolean;
  totalValue: number;
  canBeRecycled: boolean;
}

export function calculateRecyclingMetrics(
  itemId: string,
  items: Item[]
): RecyclingMetrics {
  const item = items.find((i) => i.id === itemId);
  const canBeRecycled = Boolean(
    item?.recyclesInto && Object.keys(item.recyclesInto).length > 0
  );

  return {
    depth: calculateRecyclingDepth(itemId, items),
    efficiency: calculateRecyclingEfficiency(itemId, items),
    isTerminal: isTerminalMaterial(itemId, items),
    totalValue: calculateTotalValue(itemId, items),
    canBeRecycled,
  };
}

/**
 * Get items sorted by recycling efficiency
 */
export function getItemsByEfficiency(items: Item[]): Item[] {
  return items
    .filter((item) => item.recyclesInto && Object.keys(item.recyclesInto).length > 0)
    .sort((a, b) => {
      const effA = calculateRecyclingEfficiency(a.id, items);
      const effB = calculateRecyclingEfficiency(b.id, items);
      return effB - effA;
    });
}

/**
 * Get items sorted by recycling depth
 */
export function getItemsByDepth(items: Item[]): Item[] {
  return items
    .filter((item) => item.recyclesInto && Object.keys(item.recyclesInto).length > 0)
    .sort((a, b) => {
      const depthA = calculateRecyclingDepth(a.id, items);
      const depthB = calculateRecyclingDepth(b.id, items);
      return depthB - depthA;
    });
}
