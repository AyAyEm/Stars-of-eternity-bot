const BaseWeapon = require('./baseWeapon');
const { parseSource } = require('../utils/blueprintsSource');

class WeaponEmbed extends BaseWeapon {
  constructor(weapon) {
    super(weapon);
    this.weapon = weapon;
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
    return null;
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
