'use server';

import { asc } from 'drizzle-orm';
import { db } from '../index';
import { items } from '../schema';
import type { Item, ItemsResponse } from '~/lib/types';

export async function getAllItems(){
  return db.select().from(items).orderBy(asc(items.name));
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
