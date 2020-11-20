import type { Item } from 'warframe-items';

type Drop = Extract<Item['drops'], Object>[0];

export function dropToNameAndChance(enemy: Drop) {
  const { location } = enemy;
  const chance = enemy.chance || 0;

  const [name, dropChance] = location.split(' nce: ', 2);
  const actualChance = dropChance ? Number(dropChance) * chance : chance * 100;

  return { name, chance: actualChance };
};
