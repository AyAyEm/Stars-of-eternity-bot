const _ = require('lodash');
const baseWeapon = require('./baseWeapon');
const { parseSource } = require('./utils/blueprintsSource');
const parseEnemyInfo = require('./utils/parseEnemyInfo');

class WeaponEmbed {
  constructor(weapon) {
    this.weapon = weapon;
  }

  get baseEmbed() {
    return baseWeapon(this.weapon);
  }

  get bpSource() {
    return parseSource(this.weapon);
  }

  get mainInfoPage() {
    const { weapon, bpSource } = this;
    const { components } = weapon;
    const embed = this.baseEmbed;
    const resources = components
      ? components.filter((item) => item.name !== 'Blueprint')
      : null;
    const blueprintString = bpSource.id === 1
      ? `${bpSource.location} Lab: ${bpSource.lab}`
      : `${bpSource.location}`;
    embed.addField('Blueprint', blueprintString, false);
    if (resources) {
      const resourcesNames = resources.map(({ name: resourceName, itemCount }) => (
        `${resourceName} **${itemCount}**`));
      const resourcesString = resourcesNames.reduce((resourceStr, resource) => (
        `${resourceStr}${resource}\n`
      ), '');
      embed.addField('Recursos', resourcesString, false);
    }
    return embed;
  }

  get componentsPage() {
    const { weapon, baseEmbed, bpSource } = this;
    const { components } = weapon;
    if (bpSource.location !== 'Drop') return null;
    if (!components) return null;
    const resourcesArr = [];
    components.forEach((component) => {
      const { drops, name, itemCount } = component;
      const nameString = itemCount === 1 ? name : `${name} **${itemCount}**`;
      let dataString = '\u200b';
      if (drops && name === 'Blueprint') {
        const nameAndChance = _.uniqBy(drops, 'location')
          .map((drop) => parseEnemyInfo(drop))
          .sort(({ 1: chanceA }, { 1: chanceB }) => {
            if (chanceA === chanceB) return 0;
            return chanceA < chanceB ? 1 : -1;
          })
          .slice(0, 3);
        dataString = nameAndChance
          .map(([enemyName, chance]) => `${enemyName} **${Math.round(chance * 100) / 100}%**`)
          .join('\n');
      }
      if (name !== 'Blueprint') {
        resourcesArr.push(nameString);
      } else {
        baseEmbed.addField(nameString, dataString, false);
      }
    });
    if (resourcesArr.length > 0) {
      baseEmbed.addField('Recursos', resourcesArr.join('\n'));
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
