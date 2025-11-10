import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestWithRelations } from '~/lib/types';

interface GameState {
  // Quest progress
  completedQuests: string[];
  toggleQuest: (questId: string, allQuests: QuestWithRelations[]) => void;
  
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
      completedQuests: [],
      toggleQuest: (questId, allQuests) =>
        set((state) => {
          // If quest is already completed, remove it (and potentially orphan dependent quests)
          if (state.completedQuests.includes(questId)) {
            return {
              completedQuests: state.completedQuests.filter(id => id !== questId)
            };
          }

          // Find all prerequisite quests recursively
          const questsToComplete = new Set<string>();
          
          const addPrerequisites = (currentQuestId: string) => {
            // If already in completed list, stop recursion
            if (state.completedQuests.includes(currentQuestId)) {
              return;
            }
            
            // If already processed in this iteration, stop to prevent infinite loops
            if (questsToComplete.has(currentQuestId)) {
              return;
            }
            
            // Add current quest
            questsToComplete.add(currentQuestId);
            
            // Find the quest in the provided list
            const quest = allQuests.find(q => q.id === currentQuestId);
            if (!quest) return;
            
            // Recursively add all previous quests
            if (quest.previousQuests && quest.previousQuests.length > 0) {
              quest.previousQuests.forEach(prev => {
                addPrerequisites(prev.previousQuestId);
              });
            }
          };
          
          // Start recursion from the selected quest
          addPrerequisites(questId);
          
          // Combine existing completed quests with newly completed ones
          return {
            completedQuests: [...state.completedQuests, ...Array.from(questsToComplete)]
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
        equipment_bench: 1,
        explosives_bench: 1,
        med_station: 1,
        refiner: 1,
        stash: 5,
        utility_bench: 2,
        workbench: 1
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
