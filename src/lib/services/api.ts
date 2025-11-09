import { mockQuests, mockTips } from "../data/mock-data";
import type { Quest, Workstation, Tip } from "../types";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const questsApi = {
  getAll: async (): Promise<Quest[]> => {
    await delay(300);
    return mockQuests;
  },
  
  getById: async (id: string): Promise<Quest | undefined> => {
    await delay(200);
    return mockQuests.find(q => q.id === id);
  },
  
  getByStatus: async (status: Quest["status"]): Promise<Quest[]> => {
    await delay(250);
    return mockQuests.filter(q => q.status === status);
  }
};

export const tipsApi = {
  getAll: async (): Promise<Tip[]> => {
    await delay(300);
    return mockTips;
  },
  
  create: async (tip: Omit<Tip, "id" | "datePosted">): Promise<Tip> => {
    await delay(400);
    const newTip: Tip = {
      ...tip,
      id: `tip${Date.now()}`,
      datePosted: new Date().toISOString().split('T')[0]
    };
    return newTip;
  },
  
  vote: async (tipId: string, direction: "up" | "down"): Promise<void> => {
    await delay(200);
    // In real app, this would update the backend
  }
};

export const calculatorApi = {
  calculateMaterials: async (questIds: string[], upgradeIds: string[]): Promise<any> => {
    await delay(300);
    // This would aggregate requirements from selected quests and upgrades
    return {};
  }
};
