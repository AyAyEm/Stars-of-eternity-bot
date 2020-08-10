const { MessageEmbed } = require('discord.js');

const {
  commonItems,
  uncommonItems,
  rareItems,
  weapons,
  goodOnes,
  faction,
  others,
} = require('../../static/warframe/itemNames');

const fields = [
  { name: 'Recursos comums', value: commonItems.join(' | '), inline: false },
  { name: 'Recursos incomuns', value: uncommonItems.join(' | '), inline: false },
  { name: 'Recursos raros', value: rareItems.join(' | '), inline: false },
  { name: 'Armas', value: weapons.join(' | '), inline: false },
  { name: 'Melhores items', value: goodOnes.join(' | '), inline: false },
  { name: 'Items de facção', value: faction.join(' | '), inline: false },
  { name: 'Outros', value: others.join(' | '), inline: false },
];
module.exports = new MessageEmbed()
  .addFields(fields)
  .setTitle('Possíveis opções de items para a invasão:');
