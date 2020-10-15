import { MessageEmbed } from 'discord.js';
import { eachSeries } from 'async';
import moment from 'moment-timezone';
import _ from 'lodash';

import type { Fissure } from '../../types/WFCD';

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

function fissureToString({ node }: Fissure) {
  const [mission, map] = [node.split(' ')[0], node.split(' ').slice(1).join(' ')];
  // const expirationString = moment.tz(expiry, timezone).format('HH:mm');
  return `***${map.replace(/[()]/g, '')}***    *${mission}*\n`;
};

function missionFissuresToString(missionFissures: Fissure[]) {
  return missionFissures
    .reduce((nodes, missionFissure) => `${nodes}${fissureToString(missionFissure)}`, '');
}

function getMissionsFields(missionFissures: Fissure[]) {
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

export default async function fissuresEmbed(fissures: Fissure[]) {
  const fissuresMap = new Map(
    [...Object.entries((_.groupBy(fissures, 'tier')))]
      .sort(([tierA], [tierB]) => {
        const { index: A = 0 } = fissureTiers.get(tierA) || {};
        const { index: B = 0 } = fissureTiers.get(tierB) || {};
        return B - A;
      }),
  );
  const embedsMap = new Map();
  fissuresMap.forEach((tierFissures, tier) => {
    const { icon } = fissureTiers.get(tier) || {};

    const missionsTypes = _.uniqBy(tierFissures, 'missionType')
      .reduce((types, { missionType }, index, uniqFissures) => (
        `${types} ${missionType}${index === uniqFissures.length - 1 ? '' : ','}`), '');

    const groupedByType = _.groupBy(tierFissures, 'missionType');
    const fields = Object.values(groupedByType)
      .flatMap(([...missionFissures]) => getMissionsFields(missionFissures));

    const embed = new MessageEmbed()
      .setTitle(`${tier} fendas ativas: ${tierFissures.length}`)
      .setAuthor(missionsTypes)
      .setDescription('')
      .setThumbnail(icon || '')
      .setTimestamp()
      .setFooter('Horário de São Paulo')
      .addFields(...fields);
    embedsMap.set(tier, embed);
  });
  return embedsMap;
};
