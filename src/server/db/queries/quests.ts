'use server';

import { asc, eq, gt } from 'drizzle-orm';
import { db } from '../index';
import { questRequirements, quests } from '../schema';
import type { Item, ItemsResponse } from '~/lib/types';

export async function getAllQuests() {
  return db.query.quests.findMany({
    with: {
      requirements: {
        with: {
          item: true, 
        },
      },
    },
  });
}
