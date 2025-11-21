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
  
  // Project phases completion
  completedProjectPhases: string[];
  toggleProjectPhase: (phaseId: string) => void;
  
  // Tracked items
  trackedItems: string[];
  toggleTrackedItem: (itemId: string) => void;
  
  // UI preferences
  preferences: {
    questViewMode: 'cards' | 'flowchart';
    itemViewMode: 'grid' | 'list';
    gameLanguage: 'en' | 'de' | 'fr' | 'es' | 'pt' | 'pl' | 'no' | 'da' | 'it' | 'ru' | 'ja' | 'zh-TW' | 'uk' | 'zh-CN' | 'kr' | 'tr' | 'hr' | 'sr';
  };
  setPreference: (key: keyof GameState['preferences'], value: any) => void;
  
  // Helper methods for calculator
  getIncompleteQuests: (allQuestIds: string[]) => string[];
  getIncompleteUpgrades: (allWorkstations: any[]) => string[];
  getIncompleteProjectPhases: (allProjects: any[]) => string[];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
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
        scrappy: 1,
        weapon_bench: 0,
        equipment_bench: 0,
        explosives_bench: 0,
        med_station: 0,
        refiner: 0,
        stash: 0,
        utility_bench: 0,
      },
      upgradeWorkstation: (workstationId) =>
        set((state) => ({
          workstationLevels: {
            ...state.workstationLevels,
            [workstationId]: (state.workstationLevels[workstationId] || 0) + 1
          }
        })),

      completedProjectPhases: [],
      toggleProjectPhase: (phaseId) =>
        set((state) => ({
          completedProjectPhases: state.completedProjectPhases.includes(phaseId)
            ? state.completedProjectPhases.filter(id => id !== phaseId)
            : [...state.completedProjectPhases, phaseId]
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
        itemViewMode: 'grid',
        gameLanguage: 'en'
      },
      setPreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value
          }
        })),

      // Helper methods for calculator
      getIncompleteQuests: (allQuestIds: string[]) => {
        const { completedQuests } = get();
        return allQuestIds.filter(id => !completedQuests.includes(id));
      },

      getIncompleteUpgrades: (allWorkstations: any[]) => {
        const { workstationLevels } = get();
        const incompleteUpgrades: string[] = [];
        
        allWorkstations.forEach((ws: any) => {
          const currentLevel = workstationLevels[ws.id] || 0;
          // Get all levels above current level
          ws.levels.forEach((level: any, idx: number) => {
            if (idx >= currentLevel) {
              incompleteUpgrades.push(`${ws.id}-level-${idx}`);
            }
          });
        });
        
        return incompleteUpgrades;
      },

      getIncompleteProjectPhases: (allProjects: any[]) => {
        const { completedProjectPhases } = get();
        const incompletePhases: string[] = [];
        
        allProjects.forEach((project: any) => {
          project.phases.forEach((phase: any) => {
            const phaseId = `${project.id}-phase-${phase.phase}`;
            if (!completedProjectPhases.includes(phaseId)) {
              incompletePhases.push(phaseId);
            }
          });
        });
        
        return incompletePhases;
      },
    }),
    {
      name: 'arc-raiders-storage'
    }
  )
);
