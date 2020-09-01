const { MessageEmbed } = require('discord.js');

const masteryRankImgs = require('../../../../static/masteryRankImgs');
const rivenDisposition = require('../../../../static/rivenDisposition');

class BaseWeapon {
  constructor(weapon) {
    this.weapon = weapon;
  }

  get baseEmbed() {
    const {
      name, type, imageName, category, masteryReq, disposition,
    } = this.weapon;
    const embed = new MessageEmbed();
    const fields = [{ name: 'Categoria', value: category, inline: true }];
    if (type) fields.push({ name: 'Tipo', value: type, inline: true });
    embed
      .setTitle(`${name} ${rivenDisposition[disposition - 1]}`)
      .addFields(fields)
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
      damageTypes, totalDamage, flight, projectile, secondary, areaAttack,
      category,
    } = weapon;
    const embedStrings = {
      chance: `Chance: ${Math.round(criticalChance * 100)}%\nMultiplicador: ${criticalMultiplier}x`,
      status: `Chance: ${Math.round(procChance * 100)}%`,
      damage: `${Object.entries(damageTypes).map(([type, dmg]) => `${type}: ${dmg}`).join('\n')}`,
      munition: `Pente: ${magazineSize}\nTotal: ${ammo}`,
      utility: `${category === 'Melee' ? `Velocidade de ataque: ${fireRate.toFixed(3)}` : `Taxa de tiro: ${fireRate}/s`}`
        + `${trigger ? `\nGatilho: ${trigger}` : ''}`
        + `${projectile ? `\nProjétil: ${projectile}` : ''}`
        + `${reloadTime ? `\nRecarga: ${reloadTime}s` : ''}`
        + `${accuracy ? `\nPrecisão: ${accuracy}` : ''}`,
    };
    const fields = [
      { name: `Dano ${totalDamage}`, value: embedStrings.damage, inline: false },
      { name: 'Crítico', value: embedStrings.chance, inline: false },
      { name: 'Status', value: embedStrings.status, inline: false },
      { name: 'Utilidade', value: embedStrings.utility, inline: false },
    ];
    if (ammo) fields.push({ name: 'Munição', value: embedStrings.munition, inline: true });
    baseEmbed.addFields(fields);
    return baseEmbed;
  }
}

module.exports = BaseWeapon;
