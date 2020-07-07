const baseWeapon = require('./baseWeapon');
const { parseSource } = require('./utils/blueprintsSource');

const weaponEmbed = (weapon) => {
  const { components } = weapon;
  const embed = baseWeapon(weapon);
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
};

module.exports = weaponEmbed;
