import * as _ from 'lodash';
import type { Item } from 'warframe-items';

type Drops = Item['drops'];

export function bestDrops(drops: Drops = []) {
  return drops.sort(({ chance: A }, { chance: B }) => (B || 0) - (A || 0));
}

export function dropsString(drops: Drops = []) {
  return _.uniqBy(drops, (drop) => drop.location.split(' ').slice(0, 2).join(' '))
    .reduce((bestDropsString, drop) => {
      const { location } = drop;
      const chance: number = drop.chance || 0;

      const relicName = location.split(' ').slice(0, 2).join(' ');
      const recomendedTier = location.split(' ')[2];
      return `${bestDropsString}${recomendedTier} **${relicName}** ${Math.round(chance * 100)}%\n`;
    }, '');
}
