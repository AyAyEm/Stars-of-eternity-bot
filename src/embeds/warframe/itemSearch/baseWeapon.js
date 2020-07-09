const { MessageEmbed } = require('discord.js');
const masteryRankImgs = require('../../../../static/masteryRankImgs');
const rivenDisposition = require('../../../../static/rivenDisposition');

const baseWeapon = (weapon) => {
  const {
    name, type, imageName, category, masteryReq, disposition,
  } = weapon;
  const embed = new MessageEmbed();
  embed
    .setTitle(name)
    .setDescription(rivenDisposition[disposition - 1])
    .addFields([
      { name: 'Categoria', value: category, inline: true },
      { name: 'Tipo', value: type, inline: true },
    ])
    .setThumbnail(`https://cdn.warframestat.us/img/${imageName}`)
    .setFooter(`Maestria ${masteryReq}`, masteryRankImgs[masteryReq]);
  return embed;
};

module.exports = baseWeapon;
