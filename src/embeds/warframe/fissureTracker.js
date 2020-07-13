const { MessageEmbed } = require('discord.js');
const { groupBy, eachSeries } = require('async');
const _ = require('lodash');

// // Fissures: Lith, Meso, Neo, Axi and Requiem
const fissureIcons = [
  'https://i.imgur.com/ZSxJCTI.png',
  'https://i.imgur.com/JR0s2vZ.png',
  'https://i.imgur.com/JNv2xcR.png',
  'https://i.imgur.com/sk2WIeA.png',
  'https://i.imgur.com/CNdPs70.png',
];
const fissureTiers = new Map(['Lith', 'Meso', 'Neo', 'Axi', 'Requiem']
  .map((tier, index) => [tier, { index, icon: fissureIcons[index] }]));

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
    const fields = Object.values(await groupBy(tierFissures,
      async ({ missionType }) => missionType))
      .map(([...missions]) => ({
        name: missions[0].missionType,
        value: missions.reduce((nodes, { node }) => {
          const [mission, map] = [node.split(' ')[0], node.split(' ').slice(1).join(' ')];
          return `${nodes}***${map.replace(/[()]/g, '')}***    *${mission}*\n`;
        }, ''),
      }));
    const embed = new MessageEmbed()
      .setTitle(`${tier} fendas ativas: ${tierFissures.length}`)
      .setAuthor(missionsTypes)
      .setDescription('')
      .setThumbnail(icon)
      .setTimestamp()
      .addFields(...fields);
    embedsMap.set(tier, embed);
  });
  return embedsMap;
};

module.exports = fissuresEmbed;
