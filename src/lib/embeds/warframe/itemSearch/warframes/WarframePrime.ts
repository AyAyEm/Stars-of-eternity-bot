import type { Item } from 'warframe-items';
import { EternityMessageEmbed } from '@lib';

import { BaseWarframe } from './BaseWarframe';
import { bestDrops, dropsString, filterForPrimeComponents } from '../utils';

type Component = Extract<Item['components'], Object>[0];

class WarframePrimeEmbed extends BaseWarframe {
  constructor(warframe: Item) {
    super(warframe);
    this.warframe = warframe;
  }

  get componentsPage() {
    const { warframe: weapon, baseEmbed: embed } = this;
    const { components = [] }: Item = weapon;
    const componentsFields = filterForPrimeComponents(components)
      .sort(({ name }: Component) => (name === 'Blueprint' ? -1 : 1))
      .map((component: Component) => {
        const { name, drops } = component;
        const bestDropsString = dropsString(bestDrops(drops)) || EternityMessageEmbed;
        return { name, value: bestDropsString, inline: false };
      });
    embed.addFields(...componentsFields);
    return embed;
  }
}

export function warframePrime(item: Item) {
  const warframeEmbed = new WarframePrimeEmbed(item);
  const { mainInfoPage, componentsPage } = warframeEmbed;
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  embedMap.set('♻', componentsPage);
  return embedMap;
}
