const { MessageEmbed } = require('discord.js');
const masteryRankImgs = require('../../../../static/masteryRankImgs');

const baseWeapon = (weapon) => {
  const {
    name, type, imageName, category, masteryReq,
  } = weapon;
  const embed = new MessageEmbed();
  embed
    // .setAuthor(name)
    .setTitle(name)
    .addFields([
      { name: 'Tipo', value: type, inline: true },
      { name: 'Categoria', value: category, inline: true },
    ])
    .setThumbnail(`https://cdn.warframestat.us/img/${imageName}`)
    .setFooter(`Maestria ${masteryReq}`, masteryRankImgs[masteryReq]);
  return embed;
};

module.exports = baseWeapon;
