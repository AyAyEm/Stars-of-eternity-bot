import type { Item } from 'warframe-items';
import { MultiEntryMap } from '@utils';

import { weapon, primeWeapon } from './weapons';
import { warframe, warframePrime } from './warframes';
import { mod } from './Mod';

const isPrime = ({ name }: Item) => name.includes('Prime');
const typeFunctions = new Map([
  ['Weapons', (item: Item) => (isPrime(item) ? primeWeapon(item) : weapon(item))],
  ['Warframes', (item: Item) => (isPrime(item) ? warframePrime(item) : warframe(item))],
  ['Mods', mod],
]);

const typeDictionary = new MultiEntryMap([
  [['Arch-Gun', 'Arch-Melee', 'Melee', 'Primary', 'Secondary'], 'Weapons'],
  [['Archwing', 'Warframes'], 'Warframes'],
  [['Mods'], 'Mods'],
]);

export default (item: Item) => {
  const type = typeDictionary.get(item.category);
  const typeFunction = typeFunctions.get(type);
  return typeFunction ? typeFunction(item) : null;
};
