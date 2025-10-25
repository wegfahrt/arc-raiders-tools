import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  // Quest progress
  questProgress: Record<string, { completed: boolean; objectives: Record<number, boolean> }>;
  toggleQuestObjective: (questId: string, objectiveIndex: number) => void;
  
  // Inventory
  inventory: Record<string, number>;
  updateInventory: (itemId: string, quantity: number) => void;
  
  // Workstation levels
  workstationLevels: Record<string, number>;
  upgradeWorkstation: (workstationId: string) => void;
  
  // Tracked items
  trackedItems: string[];
  toggleTrackedItem: (itemId: string) => void;
  
  // UI preferences
  preferences: {
    questViewMode: 'cards' | 'flowchart';
    itemViewMode: 'grid' | 'list';
  };
  setPreference: (key: keyof GameState['preferences'], value: any) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      questProgress: {},
      toggleQuestObjective: (questId, objectiveIndex) =>
    set((state) => {
      const prev = state.questProgress[questId];
      const prevObjectives = prev?.objectives ?? ({} as Record<number, boolean>);
      const newObjectives = {
        ...prevObjectives,
        [objectiveIndex]: !prevObjectives[objectiveIndex],
      };
      return {
        questProgress: {
          ...state.questProgress,
          [questId]: {
            completed: prev?.completed ?? false,
            objectives: newObjectives,
          },
        },
      };
    }),

      inventory: {
        fabric: 10,
        metal_parts: 25,
        tick_pod: 3
      },
      updateInventory: (itemId, quantity) =>
        set((state) => ({
          inventory: {
            ...state.inventory,
            [itemId]: quantity
          }
        })),

      workstationLevels: {
        scrappy: 2,
        weapon_bench: 1,
        armor_station: 0
      },
      upgradeWorkstation: (workstationId) =>
        set((state) => ({
          workstationLevels: {
            ...state.workstationLevels,
            [workstationId]: (state.workstationLevels[workstationId] || 0) + 1
          }
        })),

      trackedItems: [],
      toggleTrackedItem: (itemId) =>
        set((state) => ({
          trackedItems: state.trackedItems.includes(itemId)
            ? state.trackedItems.filter(id => id !== itemId)
            : [...state.trackedItems, itemId]
        })),

      preferences: {
        questViewMode: 'cards',
        itemViewMode: 'grid'
      },
      setPreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value
          }
        }))
    }),
    {
      name: 'arc-raiders-storage'
    }
  )
);
