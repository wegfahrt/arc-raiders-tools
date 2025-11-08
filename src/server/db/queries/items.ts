'use server';

import { asc, eq, gt } from 'drizzle-orm';
import { db } from '../index';
import { items, materialUsage } from '../schema';
import type { Item, ItemsResponse } from '~/lib/types';
import { getLocalizedText } from '~/lib/utils';

export async function getAllItems(){
  return db.select().from(items).orderBy(asc(items.name));
}

export async function getItemById(id: string){
  return db.select().from(items).where(eq(items.id, id)).limit(1);
}

export async function getQuestItems() {
  return db.select().from(materialUsage).where(gt(materialUsage.questRequired, 0));
}

export async function fetchItems(page: number = 1, limit: number = 50): Promise<ItemsResponse> {
  const response = await fetch(
    `https://metaforge.app/api/arc-raiders/items?page=${page}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  
  return response.json();
}

export async function fetchAllItems(): Promise<Item[]> {
  // First, fetch page 1 to get total pages
  const firstPage = await fetchItems(1, 100);
  const totalPages = firstPage.pagination.totalPages;
  
  // If only one page, return immediately
  if (totalPages === 1) {
    return firstPage.data;
  }
  
  // Fetch remaining pages in parallel
  const pagePromises = [];
  for (let page = 2; page <= totalPages; page++) {
    pagePromises.push(fetchItems(page, 100));
  }
  
  const remainingPages = await Promise.all(pagePromises);
  
  // Combine all items
  const allItems = [
    ...firstPage.data,
    ...remainingPages.flatMap(page => page.data)
  ];
  
  return allItems;
}
