import BaseWarframe from './baseWarframe';

import type { Warframe, Component } from '../../../../../types/warframe-items/warframe';

const { bestDrops, dropsString } = require('../utils/relicDrop');

class WarframePrimeEmbed extends BaseWarframe {
  constructor(warframe: Warframe) {
    super(warframe);
    this.warframe = warframe;
  }

  get componentsPage() {
    const { warframe: weapon, baseEmbed: embed } = this;
    const { components = [] }: Warframe = weapon;
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

export default (warframe: Warframe) => {
  const warframeEmbed = new WarframePrimeEmbed(warframe);
  const { mainInfoPage, componentsPage } = warframeEmbed;
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  embedMap.set('♻', componentsPage);
  return embedMap;
};
