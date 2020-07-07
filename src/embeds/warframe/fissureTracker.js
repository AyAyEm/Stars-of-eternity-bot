const { MessageEmbed } = require('discord.js');

// // Fissures: Lith, Meso, Neo, Axi and Requiem
const fissureIcons = [
  'https://i.imgur.com/ZSxJCTI.png',
  'https://i.imgur.com/JR0s2vZ.png',
  'https://i.imgur.com/JNv2xcR.png',
  'https://i.imgur.com/sk2WIeA.png',
  'https://i.imgur.com/CNdPs70.png',
];

const fissuresEmbed = (fissures) => {
  // const { id, tier, tierNum, activation, eta, missionType, node } = fissures[0];
  const missionsTypes = fissures.reduce((types, { missionType }, index) => `${types} ${missionType}${index === fissures.length - 1 ? '' : ','}`, '');
  const { tierNum, tier } = fissures[0];
  const fields = fissures.map(({ missionType, node }) => ({ name: missionType, value: node }));
  const embed = new MessageEmbed()
    .setTitle(`${tier} fendas ativas: ${fissures.length}`)
    .setAuthor(missionsTypes)
    .setDescription('')
    .setThumbnail(fissureIcons[tierNum - 1])
    .setTimestamp();
  fields.forEach((field) => embed.addField(field.name, field.value));
  return embed;
};

module.exports = fissuresEmbed;
