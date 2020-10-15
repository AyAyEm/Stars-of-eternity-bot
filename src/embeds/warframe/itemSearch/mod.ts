import { MessageEmbed } from 'discord.js';
import { blankField } from '../../../utils/discordjs/MessageEmbed';
import _ from 'lodash';

import type { Item as DefaultItem } from 'warframe-items';

interface Item extends DefaultItem {
  name: string;
  levelStats: { stats: string[] }[];
  transmutable: boolean;
}

const groupsDictionary = new Map([
  ['Enemy Mod Tables', 'Inimigos'],
  ['Mission Rewards', 'Recompensa de missão'],
]);

const rarityColorMap = new Map([
  ['Common', '#876f4e'],
  ['Uncommon', '#fefefe'],
  ['Rare', '#dec67c'],
  ['Legendary', '#fffeff'],
  ['Requiem', 'DARK_RED'],
]);

class ModEmbed {
  public getBaseEmbed: () => InstanceType<typeof MessageEmbed>;

  constructor(public mod: Item) {
    const {
      name, polarity, rarity, imageName,
    } = mod;

    this.getBaseEmbed = () => new MessageEmbed()
      .setTitle(`Mod: ${name}`)
      .setThumbnail(`https://cdn.warframestat.us/img/${imageName}`)
      .setFooter(`${rarity} ${polarity}`)
      .setColor(rarityColorMap.get(rarity as string) || 'WHITE');
  }

  get mainInfoPage() {
    const { getBaseEmbed, mod } = this;
    const {
      tradable, levelStats, transmutable,
    } = mod;

    const embedPage = getBaseEmbed().addFields([
      { name: 'Trocável', value: tradable ? '✅' : '❌', inline: true },
      { name: 'Transmutável', value: transmutable ? '✅' : '❌', inline: true },
      { ...blankField, inline: true },
    ]);

    if (levelStats) {
      const statsFields = levelStats[0].stats.map((stat, index) => {
        const percentageRegex = /[+-]?\d+%/;
        const minStat = stat.match(percentageRegex)?.[0];
        const maxStat = levelStats[levelStats.length - 1].stats[index].match(percentageRegex)?.[0];

        return [
          { name: 'Atributo', value: stat, inline: true },
          { name: 'Min/Max', value: `${minStat}/${maxStat}`, inline: true },
          { ...blankField, inline: true },
        ];
      });
      embedPage.addFields(statsFields.flat());
    }
    return embedPage;
  }

  get dropsPage() {
    const { getBaseEmbed, mod: { drops } } = this;
    const embedPage = drops ? getBaseEmbed() : null;
    if (embedPage) {
      const dropsGroups = _.groupBy(drops, 'type');
      _.forEach(dropsGroups, (dropsList, group) => {
        const [
          locationsString,
          percentagesString,
        ] = dropsList.reduce(([locations, percentages], { location, chance }) => (
          [
            `${locations}${location}\n`,
            `${percentages}${((chance || 0) * 100).toFixed(2)}%\n`,
          ]
        ), ['', '']);
        const translatedGroup = groupsDictionary.get(group) || group;
        embedPage.addFields([
          { name: translatedGroup, value: locationsString, inline: true },
          { name: 'chance', value: percentagesString, inline: true },
          { ...blankField, inline: true },
        ]);
      });
    }
    return embedPage;
  }
}

export function mod(mod: Item) {
  const modEmbed = new ModEmbed(mod);
  const { mainInfoPage, dropsPage } = modEmbed;
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  if (dropsPage) embedMap.set('♻', dropsPage);

  return embedMap;
};
