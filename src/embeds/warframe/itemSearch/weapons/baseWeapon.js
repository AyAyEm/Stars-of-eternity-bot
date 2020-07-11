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
      // eslint-disable-next-line no-unused-vars
      criticalChance, criticalMultiplier, procChance, fireRate, accuracy,
      // eslint-disable-next-line no-unused-vars
      noise, trigger, magazineSize, reloadTime, multishot, ammo, damage,
      // eslint-disable-next-line no-unused-vars
      damageTypes, flight, projectile, secondary, areaAttack,
    } = weapon;
    const embedStrings = {
      chance: `Chance: ${Math.round(criticalChance * 100)}%\n`
        + `Multiplicador: ${criticalMultiplier}x`,
      status: `Chance: ${Math.round(procChance * 100)}%`,
      dano: `Base: ${damage}`,
      munition: `Pente: ${magazineSize}\n`
        + `Total: ${ammo}`,
    };
    const fields = [
      { name: 'Dano', value: embedStrings.dano, inline: false },
      { name: 'Crítico', value: embedStrings.chance, inline: false },
      { name: 'Status', value: embedStrings.status, inline: false },
      { name: 'Munição', value: embedStrings.munition, inline: true },
    ];
    baseEmbed.addFields(fields);
    return baseEmbed;
  }
}

module.exports = BaseWeapon;
