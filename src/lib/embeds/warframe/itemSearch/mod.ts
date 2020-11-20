import { EternityMessageEmbed } from '@lib';
import * as _ from 'lodash';

import type { Item } from 'warframe-items';

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
  public getBaseEmbed: () => InstanceType<typeof EternityMessageEmbed>;

  constructor(public modItem: Item) {
    const {
      name, polarity, rarity, imageName,
    } = modItem;

    this.getBaseEmbed = () => new EternityMessageEmbed()
      .setTitle(`Mod: ${name}`)
      .setThumbnail(`https://cdn.warframestat.us/img/${imageName}`)
      .setFooter(`${rarity} ${polarity}`)
      .setColor(rarityColorMap.get(rarity as string) || 'WHITE');
  }

  get mainInfoPage() {
    const { getBaseEmbed, modItem } = this;
    const {
      tradable, levelStats, transmutable,
    } = modItem;

    const embedPage = getBaseEmbed().addFields([
      { name: 'Trocável', value: tradable ? '✅' : '❌', inline: true },
      { name: 'Transmutável', value: transmutable ? '✅' : '❌', inline: true },
      { ...EternityMessageEmbed.blankField, inline: true },
    ]);

    if (levelStats) {
      const statsFields = levelStats[0].stats.map((stat, index) => {
        const percentageRegex = /[+-]?\d+%/;
        const minStat = stat.match(percentageRegex)?.[0];
        const maxStat = levelStats[levelStats.length - 1].stats[index].match(percentageRegex)?.[0];

        return [
          { name: 'Atributo', value: stat, inline: true },
          { name: 'Min/Max', value: `${minStat}/${maxStat}`, inline: true },
          { ...EternityMessageEmbed.blankField, inline: true },
        ];
      });
      embedPage.addFields(statsFields.flat());
    }
    return embedPage;
  }

  get dropsPage() {
    const { getBaseEmbed, modItem: { drops } } = this;
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
          { ...EternityMessageEmbed.blankField, inline: true },
        ]);
      });
    }
    return embedPage;
  }
}

export function mod(modItem: Item) {
  const modEmbed = new ModEmbed(modItem);
  const { mainInfoPage, dropsPage } = modEmbed;
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  if (dropsPage) embedMap.set('♻', dropsPage);

  return embedMap;
}
