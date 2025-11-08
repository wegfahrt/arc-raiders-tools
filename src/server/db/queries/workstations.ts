'use server';

import { asc, eq, gt } from 'drizzle-orm';
import { db } from '../index';
import { hideoutLevels, hideoutModules, hideoutRequirements } from '../schema';
import type { Item, ItemsResponse } from '~/lib/types';
import { getLocalizedText } from '~/lib/utils';

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
  });
}
