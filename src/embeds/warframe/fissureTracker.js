const { MessageEmbed } = require('discord.js');
const { groupBy, eachSeries } = require('async');
const moment = require('moment-timezone');
const _ = require('lodash');

const { timezone } = require('../../config').config;
// Fissures: Lith, Meso, Neo, Axi and Requiem
const fissureIcons = [
  'https://i.imgur.com/ZSxJCTI.png',
  'https://i.imgur.com/JR0s2vZ.png',
  'https://i.imgur.com/JNv2xcR.png',
  'https://i.imgur.com/sk2WIeA.png',
  'https://i.imgur.com/CNdPs70.png',
];
const fissureTiers = new Map(['Lith', 'Meso', 'Neo', 'Axi', 'Requiem']
  .map((tier, index) => [tier, { index, icon: fissureIcons[index] }]));
const fissureToString = ({ node }) => {
  const [mission, map] = [node.split(' ')[0], node.split(' ').slice(1).join(' ')];
  // const expirationString = moment.tz(expiry, timezone).format('HH:mm');
  return `***${map.replace(/[()]/g, '')}***    *${mission}*\n`;
};
const missionFissuresToString = (missionFissures) => (
  missionFissures.reduce((nodes, missionFissure) => `${nodes}${fissureToString(missionFissure)}`, ''));
const getMissionsFields = (missionFissures) => {
  const expirationString = missionFissures.reduce((expirations, { expiry }) => {
    const expiration = moment.tz(expiry, timezone).format('HH:mm');
    return `${expirations}*${expiration}*\n`;
  }, '');
  const enemyFactions = missionFissures.reduce((factions, { enemy }) => `${factions}${enemy}\n`, '');
  return [{
    name: `${missionFissures[0].missionType}`,
    value: missionFissuresToString(missionFissures),
    inline: true,
  }, {
    name: 'Facção',
    value: enemyFactions,
    inline: true,
  }, {
    name: 'Expira ás',
    value: expirationString,
    inline: true,
  }];
};

const fissuresEmbed = async (fissures) => {
  const fissuresMap = new Map(
    [...Object.entries((await groupBy(fissures, async (fissure) => fissure.tier)))]
      .sort(([tierA], [tierB]) => {
        const [{ index: A }, { index: B }] = [fissureTiers.get(tierB), fissureTiers.get(tierA)];
        return A - B;
      }),
  );
  const embedsMap = new Map();
  await eachSeries(fissuresMap, async ([tier, tierFissures]) => {
    const { icon } = fissureTiers.get(tier);
    const missionsTypes = _.uniqBy(tierFissures, 'missionType')
      .reduce((types, { missionType }, index, uniqFissures) => (
        `${types} ${missionType}${index === uniqFissures.length - 1 ? '' : ','}`), '');
    const groupedByType = await groupBy(tierFissures, async ({ missionType }) => missionType);
    const fields = Object.values(groupedByType)
      .flatMap(([...missionFissures]) => getMissionsFields(missionFissures));
    const embed = new MessageEmbed()
      .setTitle(`${tier} fendas ativas: ${tierFissures.length}`)
      .setAuthor(missionsTypes)
      .setDescription('')
      .setThumbnail(icon)
      .setTimestamp()
      .setFooter('Horário de São Paulo')
      .addFields(...fields);
    embedsMap.set(tier, embed);
  });
  return embedsMap;
};

module.exports = fissuresEmbed;
