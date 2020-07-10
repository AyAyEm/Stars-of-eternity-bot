const weapon = require('./weapons/weapon');
const primeWeapon = require('./weapons/primeWeapon');

const typeFunctions = new Map([
  ['Weapons', (item) => (item.name.includes('Prime') ? primeWeapon(item) : weapon(item))],
]);

module.exports = (item) => {
  const type = item.uniqueName.split('/')[2];
  return typeFunctions.get(type)(item);
};
