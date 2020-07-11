const _ = require('lodash');

const bestDrops = (drops) => drops.sort(({ chance: A }, { chance: B }) => B - A);
const dropsString = (drops) => _.uniqBy(drops, (drop) => drop.location.split(' ').slice(0, 2).join(' '))
  .reduce((bestDropsString, drop) => {
    const { location, chance } = drop;
    const relicName = location.split(' ').slice(0, 2).join(' ');
    const recomendedTier = location.split(' ')[2];
    return `${bestDropsString}${recomendedTier} **${relicName}** ${Math.round(chance * 100)}%\n`;
  }, '');

module.exports = { bestDrops, dropsString };
