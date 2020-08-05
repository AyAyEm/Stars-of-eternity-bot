const _ = require('lodash');
const BaseWeapon = require('./baseWeapon');
const specialItems = require('../specialItems');
const { parseSource } = require('../utils/blueprintsSource');
const dropToNameAndChance = require('../utils/dropToNameAndChance');
const { biFilter } = require('../../../../utils');

class WeaponEmbed extends BaseWeapon {
  constructor(weapon) {
    super(weapon);
    this.weapon = weapon;
  }

  get bpSource() {
    return parseSource(this.weapon);
  }

  get mainInfoPage() {
    const { weapon, bpSource, baseEmbed: embed } = this;
    const { name: weaponName } = weapon;
    const specialAdjustment = specialItems.get(weaponName);

    if (specialAdjustment) {
      return specialAdjustment(embed);
    }

    const components = weapon.components || [];
    const [resources, componentItems] = biFilter(components.filter(({ name }) => name !== 'Blueprint'), ({ uniqueName }) => (
      uniqueName.includes('Items')));
    const blueprintString = bpSource.id === 1
      ? `${bpSource.location} Lab: ${bpSource.lab}`
      : `${bpSource.location}`;
    embed.addField('Blueprint', blueprintString, false);

    if (componentItems.length > 0) {
      const componentsString = componentItems
        .filter(({ drops }) => drops)
        .map(({ name, itemCount }) => `${name} **${itemCount}**`)
        .join('\n');
      embed.addField('Componentes', componentsString, false);
    }

    if (resources.length > 0) {
      const resourcesNames = resources.map(({ name: resourceName, itemCount }) => (
        `${resourceName} **${itemCount}**`));
      const resourcesString = resourcesNames.join('\n');
      embed.addField('Recursos', resourcesString, false);
    }
    return embed;
  }

  get componentsPage() {
    const { weapon, baseEmbed, bpSource } = this;
    const { components } = weapon;

    if (bpSource.location !== 'Drop') return null;
    if (!components) return null;

    const [resources, componentItems] = biFilter(components, ({ uniqueName }) => (
      uniqueName.includes('Items')));
    const componentsFields = componentItems.map(({ drops, name }) => {
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
  const { mainInfoPage, componentsPage, baseStatusEmbed } = weaponEmbed;
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  if (componentsPage) embedMap.set('♻', componentsPage);
  embedMap.set('🃏', baseStatusEmbed);
  return embedMap;
};
