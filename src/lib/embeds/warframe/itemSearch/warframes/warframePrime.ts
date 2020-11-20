import type { Item } from 'warframe-items';

import { BaseWarframe } from './baseWarframe';
import { bestDrops, dropsString } from '../utils/relicDrop';

type Component = Extract<Item['components'], Object>[0];

class WarframePrimeEmbed extends BaseWarframe {
  constructor(warframe: Item) {
    super(warframe);
    this.warframe = warframe;
  }

  get componentsPage() {
    const { warframe: weapon, baseEmbed: embed } = this;
    const { components = [] }: Item = weapon;
    const componentsFields = components
      .filter(({ drops = [] }: Component) => drops[0]?.type === 'Relics')
      .sort(({ name }: Component) => (name === 'Blueprint' ? -1 : 1))
      .map((component: Component) => {
        const { name, drops } = component;
        const bestDropsString = dropsString(bestDrops(drops));
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
