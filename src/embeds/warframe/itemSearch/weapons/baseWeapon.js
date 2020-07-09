const { MessageEmbed } = require('discord.js');
const reqLib = require('app-root-path').require;

const masteryRankImgs = reqLib('/static/masteryRankImgs');
const rivenDisposition = reqLib('/static/rivenDisposition');

const baseWeapon = (weapon) => {
  const {
    name, type, imageName, category, masteryReq, disposition,
  } = weapon;
  const embed = new MessageEmbed();
  embed
    .setTitle(`${name} ${rivenDisposition[disposition - 1]}`)
    .addFields([
      { name: 'Categoria', value: category, inline: true },
      { name: 'Tipo', value: type, inline: true },
    ])
    .setThumbnail(`https://cdn.warframestat.us/img/${imageName}`)
    .setFooter(`Maestria ${masteryReq}`, masteryRankImgs[masteryReq]);
  return embed;
};

module.exports = baseWeapon;
