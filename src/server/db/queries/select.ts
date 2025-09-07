import { asc } from 'drizzle-orm';
import { db } from '../index';
import { items } from '../schema';

export async function getAllItems(){
  return db.select().from(items).orderBy(asc(items.name));
}
