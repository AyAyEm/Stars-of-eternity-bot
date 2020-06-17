const { MessageEmbed } = require('discord.js');

const commonItems = [
  'nanoSpores', 'rubedo', 'salvage', 'plastids', 'polymerBundle',
  'cryotic', 'circuits', 'ferrite', 'alloyPlate',
];
const uncommonItems = ['oxium', 'gallium', 'morphics', 'controlModule'];
const rareItems = [
  'neuralSensors', 'orokinCell', 'argonCrystal', 'tellurium', 'neurodes', 'nitain',
];
const weapons = ['vandal', 'wraith', 'weapon'];
const goodOnes = ['reactor', 'catalyst', 'forma', 'aura', 'exilus', 'riven'];
const faction = ['fieldron', 'detonite', 'mutagen'];
const others = [
  'mutalist', 'forma', 'synthula', 'kavatGene',
  'kubrowEgg', 'traces', 'other', 'credits', 'skin',
  'helmet', 'nightmare', 'endo',
];

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
