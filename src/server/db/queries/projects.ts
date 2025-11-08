'use server';

import { db } from '../index';

export async function getAllProjects() {
  return db.query.projects.findMany({
    with: {
      phases: {
        with: {
          itemRequirements: {
            with: {
              item: true,
            },
          },
          categoryRequirements: true,
        },
        orderBy: (phases, { asc }) => [asc(phases.phase)],
      },
    },
  });
}
