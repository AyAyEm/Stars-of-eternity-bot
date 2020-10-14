const _ = require('lodash');
const { biFilter } = require('../../../../utils');
const dropToNameAndChance = require('../utils/dropToNameAndChance');

import BaseWarframe from './baseWarframe';

import type { Item } from 'warframe-items';

type Component = Extract<Item['components'], Object>[0];
type Drop = Extract<Item['drops'], Object>[0];

class WeaponEmbed extends BaseWarframe {
  constructor(warframe: Item) {
    super(warframe);
    this.warframe = warframe;
  }

  public componentsPage() {
    const { warframe, baseEmbed } = this;
    const { components, category } = warframe;
    if (!components) return null;
    const [resources, componentItems] = biFilter(components, ({ uniqueName }: Item) => (
      uniqueName.includes('Items')));
    if (category === 'Warframes') {
      const componentsFields = componentItems
        .filter(({ drops }: Component) => drops)
        .map(({ drops, name }: Component) => {
          type dropChance = {
            chance: number,
            name: string,
          }
          const nameAndChance = _.uniqBy(drops, 'location')
            .map((drop: Drop) => dropToNameAndChance(drop))
            .sort(({ chance: a }: dropChance, { chance: b }: dropChance) => {
              if (a === b) return 0;
              return a < b ? 1 : -1;
            })
            .slice(0, 3);
          const dataString = nameAndChance
            .map(({ name: enemyName, chance }: dropChance) => `${enemyName} **${Math.round(chance * 100) / 100}%**`)
            .join('\n');
          return { name, value: dataString, inline: false };
        });
      baseEmbed.addFields(componentsFields);
    } else if (category === 'Archwing') {
      const componentsFields = componentItems
        .map(({ name }: Component) => ({ name, value: 'Tenno lab', inline: false }));
      baseEmbed.addFields(componentsFields);
    }
    if (resources.length > 0) {
      const resourcesString = resources
        .map(({ name, itemCount }: Component) => `${name} **${itemCount}**`)
        .join('\n');
      baseEmbed.addField('Recursos', resourcesString, false);
    }
    return baseEmbed;
  }
}

export default (warframe: Item) => {
  const warframeEmbed = new WeaponEmbed(warframe);
  const { mainInfoPage, componentsPage } = warframeEmbed.buildPages();
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  if (componentsPage) embedMap.set('♻', componentsPage);
  return embedMap;
};
