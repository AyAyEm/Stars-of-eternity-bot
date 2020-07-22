const _ = require('lodash');
const { biFilter } = require('../../../../utils');
const dropToNameAndChance = require('../utils/dropToNameAndChance');
const BaseWarframe = require('./baseWarframe');

class WeaponEmbed extends BaseWarframe {
  constructor(warframe) {
    super(warframe);
    this.warframe = warframe;
  }

  get componentsPage() {
    const { warframe, baseEmbed } = this;
    const { components, category } = warframe;
    if (!components) return null;
    const [resources, componentItems] = biFilter(components, ({ uniqueName }) => (
      uniqueName.includes('Items')));
    if (category === 'Warframes') {
      const componentsFields = componentItems
        .filter(({ drops }) => drops)
        .map(({ drops, name }) => {
          const nameAndChance = _.uniqBy(drops, 'location')
            .map((drop) => dropToNameAndChance(drop))
            .sort(({ 1: chanceA }, { 1: chanceB }) => {
              if (chanceA === chanceB) return 0;
              return chanceA < chanceB ? 1 : -1;
            })
            .slice(0, 3);
          const dataString = nameAndChance
            .map(([enemyName, chance]) => `${enemyName} **${Math.round(chance * 100) / 100}%**`)
            .join('\n');
          return { name, value: dataString, inline: false };
        });
      baseEmbed.addFields(componentsFields);
    }
    if (category === 'Archwing') {
      const componentsFields = componentItems
        .map(({ name }) => ({ name, value: 'Tenno lab', inline: false }));
      baseEmbed.addFields(componentsFields);
    }
    if (resources.length > 0) {
      const resourcesString = resources
        .map(({ name, itemCount }) => `${name} **${itemCount}**`)
        .join('\n');
      baseEmbed.addField('Recursos', resourcesString, false);
    }
    return baseEmbed;
  }
}

module.exports = (weapon) => {
  const weaponEmbed = new WeaponEmbed(weapon);
  const { mainInfoPage, componentsPage } = weaponEmbed;
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  if (componentsPage) embedMap.set('♻', componentsPage);
  return embedMap;
};
