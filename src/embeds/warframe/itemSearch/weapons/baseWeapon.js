const { MessageEmbed } = require('discord.js');
const reqLib = require('app-root-path').require;

const masteryRankImgs = reqLib('/static/masteryRankImgs');
const rivenDisposition = reqLib('/static/rivenDisposition');

class BaseWeapon {
  constructor(weapon) {
    this.weapon = weapon;
  }

  get baseEmbed() {
    const {
      name, type, imageName, category, masteryReq, disposition,
    } = this.weapon;
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
  }

  get baseStatusEmbed() {
    const { baseEmbed, weapon } = this;
    const {
      criticalChance, criticalMultiplier, procChance, fireRate, accuracy,
      noise, trigger, magazineSize, reloadTime, multishot, ammo, damage,
      damageTypes, flight, projectile, secondary, areaAttack
    } = weapon;
    baseEmbed.addField('teste', 'teste');
    return baseEmbed;
  }
}

module.exports = BaseWeapon;
