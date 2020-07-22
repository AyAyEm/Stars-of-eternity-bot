const { bestDrops, dropsString } = require('../utils/relicDrop');
const BaseWarframe = require('./baseWarframe');

class WarframePrimeEmbed extends BaseWarframe {
  constructor(warframe) {
    super(warframe);
    this.warframe = warframe;
  }

  get componentsPage() {
    const { warframe: weapon, baseEmbed: embed } = this;
    const { components } = weapon;
    const componentsFields = components
      .filter(({ drops }) => drops[0].type === 'Relics')
      .sort(({ name }) => (name === 'Blueprint' ? -1 : 1))
      .map((component) => {
        const { name, drops } = component;
        const bestDropsString = dropsString(bestDrops(drops));
        return { name, value: bestDropsString, inline: false };
      });
    embed.addFields(...componentsFields);
    return embed;
  }
}

module.exports = (warframe) => {
  const warframeEmbed = new WarframePrimeEmbed(warframe);
  const { mainInfoPage, componentsPage } = warframeEmbed;
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  embedMap.set('♻', componentsPage);
  return embedMap;
};
