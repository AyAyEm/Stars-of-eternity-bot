const { MessageEmbed } = require('discord.js');

const parseSource = require('../utils/blueprintsSource');
const { biFilter } = require('../../../../utils');
const masteryRankImgs = require('../../../../static/masteryRankImgs');

import type { Warframe, Component } from '../../../../../types/warframe-items/warframe';

class BaseWarframe {
  constructor(public warframe: Warframe) { }

  public get baseEmbed() {
    const {
      name, imageName, masteryReq, category,
    } = this.warframe;
    const embed = new MessageEmbed();
    embed
      .setTitle(`${name}`)
      .setThumbnail(`https://cdn.warframestat.us/img/${imageName}`)
      .addField('Categoria', category, false)
      .setFooter(`Maestria ${masteryReq}`, masteryRankImgs[masteryReq]);
    return embed;
  }

  private get bpSource() {
    return parseSource(this.warframe);
  }

  public mainInfoPage() {
    const { warframe, bpSource } = this;
    const {
      components = [], health, armor, shield, power, sprintSpeed,
    }: Warframe = warframe;
    const embed = this.baseEmbed;
    embed.addField('Status', `Vida: ${health}\nArmadura: ${armor}\nEscudo: ${shield}\n`
      + `Energia: ${power}\nVelocidade de corrida: ${sprintSpeed}`, false);

    const [
      resources,
      componentItems,
    ]: [Component[], Component[]] = biFilter(components.filter(({ name }) => name !== 'Blueprint'),
      ({ uniqueName }: Warframe) => (
        uniqueName.includes('Items')));

    const blueprintString = bpSource.id === 1
      ? `${bpSource.location} Lab: ${bpSource.lab}`
      : `${bpSource.location}`;
    embed.addField('Blueprint', blueprintString, false);
    if (componentItems.length > 0) {
      const componentsString = componentItems
        .map(({ name, itemCount }) => `${name} **${itemCount}**`)
        .join('\n');
      embed.addField('Componentes', componentsString, false);
    }
    if (resources.length > 0) {
      const resourcesNames = resources.map(({ name: resourceName, itemCount }) => (
        `${resourceName} **${itemCount}**`));
      const resourcesString = resourcesNames.join('\n');
      embed.addField('Recursos', resourcesString, false);
    }
    return embed;
  }

  public buildPages() {
    const pageNames: string[] = Object.keys(this).filter((key) => key.includes('Page'));
    const pages: any = {};
    const _this: any = this;
    pageNames.forEach((page: string) => {
      pages[page] = _this[page]();
    });
    return pages;
  }
}

export default BaseWarframe;
