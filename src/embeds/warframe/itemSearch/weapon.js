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

  get mainInfoPage() {
    const { weapon } = this;
    const { components } = weapon;
    const embed = this.baseEmbed;
    const resources = components
      ? components.filter((item) => item.name !== 'Blueprint')
      : null;
    const bpObj = parseSource(weapon);
    const blueprintString = bpObj.id === 1
      ? `${bpObj.location} Lab: ${bpObj.lab}`
      : `${bpObj.location}`;
    embed.addField('Blueprint', blueprintString, false);
    if (resources) {
      const resourcesNames = resources.map(({ name: resourceName, itemCount }) => (
        `${resourceName}: __${itemCount}__`));
      const resourcesString = resourcesNames.reduce((resourceStr, resource) => (
        `${resourceStr}${resource}\n`
      ), '');
      embed.addField('Recursos', resourcesString, false);
    }
    return embed;
  }

  get componentsPage() {
    const { weapon, baseEmbed } = this;
    const { components } = weapon;
    if (!components) return null;
    components.forEach((component) => {
      const { drops, name, itemCount } = component;
      const nameString = itemCount === 1 ? name : `${itemCount} ${name}`;
      let dataString = '\u200b';
      if (drops && name === 'Blueprint') {
        const bestDrops = drops
          .sort(({ chance: a }, { chance: b }) => a > b)
          .slice(0, 3);
        const nameAndChance = bestDrops.map((drop) => parseEnemyInfo(drop));
        dataString = nameAndChance
          .map(([enemyName, chance]) => `${enemyName} **${chance}%**`)
          .join('\n');
      }
      baseEmbed.addField(nameString, dataString, false);
    });
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
