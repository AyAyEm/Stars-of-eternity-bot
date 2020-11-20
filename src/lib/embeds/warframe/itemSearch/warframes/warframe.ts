import * as _ from 'lodash';
import { biFilter } from '@utils';

import type { Item } from 'warframe-items';

import { BaseWarframe } from './baseWarframe';
import { dropToNameAndChance } from '../utils';

type Component = Extract<Item['components'], Object>[0];
type Drop = Extract<Item['drops'], Object>[0];

class WeaponEmbed extends BaseWarframe {
  constructor(item: Item) {
    super(item);
    this.warframe = item;
  }

  public componentsPage() {
    const { components, category } = this.warframe;
    if (!components) return null;
    const [resources, componentItems] = biFilter(components, ({ uniqueName }: Item) => (
      uniqueName.includes('Items')));
    if (category === 'Warframes') {
      const componentsFields = componentItems
        .filter(({ drops }: Component) => drops)
        .map(({ drops, name }: Component) => {
          type DropChance = {
            chance: number,
            name: string,
          };
          const nameAndChance = _.uniqBy(drops, 'location')
            .map((drop: Drop) => dropToNameAndChance(drop))
            .sort(({ chance: a }: DropChance, { chance: b }: DropChance) => {
              if (a === b) return 0;
              return a < b ? 1 : -1;
            })
            .slice(0, 3);
          const dataString = nameAndChance
            .map(({ name: enemyName, chance }: DropChance) => `${enemyName} **${Math.round(chance * 100) / 100}%**`)
            .join('\n');
          return { name, value: dataString, inline: false };
        });
      this.baseEmbed.addFields(componentsFields);
    } else if (category === 'Archwing') {
      const componentsFields = componentItems
        .map(({ name }: Component) => ({ name, value: 'Tenno lab', inline: false }));
      this.baseEmbed.addFields(componentsFields);
    }
    if (resources.length > 0) {
      const resourcesString = resources
        .map(({ name, itemCount }: Component) => `${name} **${itemCount}**`)
        .join('\n');
      this.baseEmbed.addField('Recursos', resourcesString, false);
    }
    return this.baseEmbed;
  }
}

export function warframe(item: Item) {
  const warframeEmbed = new WeaponEmbed(item);
  const { mainInfoPage, componentsPage } = warframeEmbed.buildPages();
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  if (componentsPage) embedMap.set('♻', componentsPage);
  return embedMap;
}
