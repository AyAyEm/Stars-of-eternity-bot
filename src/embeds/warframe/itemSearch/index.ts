import { weapon, primeWeapon } from './weapons';
import { warframe, warframePrime } from './warframes';
import { mod } from './mod';

import type { Item as DefaultItem } from 'warframe-items';

interface Item extends DefaultItem {
  name: string;
  levelStats: { stats: string[] }[];
  transmutable: boolean;
}

const isPrime = ({ name }: Item) => name.includes('Prime');
const typeFunctions = new Map([
  ['Weapons', (item: Item) => (isPrime(item) ? primeWeapon(item) : weapon(item))],
  ['Warframes', (item: Item) => (isPrime(item) ? warframePrime(item) : warframe(item))],
  ['Mods', mod],
]);

const typeDictionary = new Map([
  [['Arch-Gun', 'Arch-Melee', 'Melee', 'Primary', 'Secondary'], 'Weapons'],
  [['Archwing', 'Warframes'], 'Warframes'],
  [['Mods'], 'Mods'],
].flatMap(([keys, value]) => (keys as string[]).map((key) => [key, value])));

export default (item: Item) => {
  const type = typeDictionary.get(item.category);
  const typeFunction = typeFunctions.get(type as string);
  return typeFunction ? typeFunction(item) : null;
};
