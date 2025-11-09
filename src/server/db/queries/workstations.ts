'use server';

import { asc } from 'drizzle-orm';
import { db } from '../index';
import { hideoutModules } from '../schema';


export async function getAllHideoutModules() {
  return db.query.hideoutModules.findMany({
    with: {
      levels: {
        with: {
          requirements: {
            with: {
              item: true, // Include item details
            },
          },
        },
      },
    },
    orderBy: [asc(hideoutModules.maxLevel)],
  });
}
