'use server';

import { asc, eq, gt, ne } from 'drizzle-orm';
import { db } from '../index';
import { questRequirements, quests } from '../schema';
import type { Item, ItemsResponse, QuestWithRelations } from '~/lib/types';

export async function getAllQuests(): Promise<QuestWithRelations[]> {
  return db.query.quests.findMany({
    with: {
      previousQuests: true,
      nextQuests: true,
      requirements: {
        with: {
          item: true, 
        },
      },
      rewards: {
        with: {
          item: true,
        },
      },
    },
    orderBy: asc(quests.id),
  });
}
