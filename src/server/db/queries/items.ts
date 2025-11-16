'use server';

import { asc, eq, gt, ne } from 'drizzle-orm';
import { db } from '../index';
import { items, materialUsage } from '../schema';
import type { Item } from '~/lib/types';

export async function getAllItems(): Promise<Item[]> {
  // Add filter to exclude "Unknown" type items
  const result = await db.select().from(items)
    .where(ne(items.type, 'Unknown'))
    .orderBy(asc(items.name));
  
  // Transform null to undefined for optional fields
  return result.map(item => ({
    ...item,
    recyclesInto: item.recyclesInto ?? undefined,
    salvagesInto: item.salvagesInto ?? undefined,
    recipe: item.recipe ?? undefined,
    effects: item.effects ?? undefined,
    weightKg: item.weightKg ? Number(item.weightKg) : undefined,
  })) as Item[];
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const result = await db.select().from(items).where(eq(items.id, id)).limit(1);
  if (!result[0]) return undefined;
  
  const item = result[0];
  return {
    ...item,
    recyclesInto: item.recyclesInto ?? undefined,
    salvagesInto: item.salvagesInto ?? undefined,
    recipe: item.recipe ?? undefined,
    effects: item.effects ?? undefined,
    weightKg: item.weightKg ? Number(item.weightKg) : undefined,
  } as Item;
}

export async function getQuestItems() {
  return db.select().from(materialUsage).where(gt(materialUsage.questRequired, 0));
}

export async function getRecyclableItems(): Promise<Item[]> {
  const result = await db.select().from(items)
    .where(ne(items.type, 'Unknown'))
    .orderBy(asc(items.name));
  
  // Transform null to undefined for optional fields
  return result.map(item => ({
    ...item,
    recyclesInto: item.recyclesInto ?? undefined,
    salvagesInto: item.salvagesInto ?? undefined,
    recipe: item.recipe ?? undefined,
    effects: item.effects ?? undefined,
    weightKg: item.weightKg ? Number(item.weightKg) : undefined,
  })) as Item[];
}
