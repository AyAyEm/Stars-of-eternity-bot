import { MessageEmbed  } from 'discord.js'
import { itemNames } from '../../static/warframe/itemNames';

const {
  commonItems,
  uncommonItems,
  rareItems,
  weapons,
  goodOnes,
  faction,
  others,
} = itemNames;

const fields = [
  { name: 'Recursos comums', value: commonItems.join(' | '), inline: false },
  { name: 'Recursos incomuns', value: uncommonItems.join(' | '), inline: false },
  { name: 'Recursos raros', value: rareItems.join(' | '), inline: false },
  { name: 'Armas', value: weapons.join(' | '), inline: false },
  { name: 'Melhores items', value: goodOnes.join(' | '), inline: false },
  { name: 'Items de facção', value: faction.join(' | '), inline: false },
  { name: 'Outros', value: others.join(' | '), inline: false },
];
export default new MessageEmbed()
  .addFields(fields)
  .setTitle('Possíveis opções de items para a invasão:');
