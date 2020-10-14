import { MessageEmbed } from 'discord.js'

import { blueprintSource } from '../utils'
import { biFilter } from '../../../../utils'
import { masteryRankImgs } from '../../../../static'

import type { Item } from 'warframe-items';

type Component = Extract<Item['components'], Object>[0];

class BaseWarframe {
  constructor(public warframe: Item) { }

  public get baseEmbed() {
    const {
      name, imageName, masteryReq, category,
    } = this.warframe;
    const embed = new MessageEmbed();
    embed
      .setTitle(`${name}`)
      .setThumbnail(`https://cdn.warframestat.us/img/${imageName}`)
      .addField('Categoria', category, false)
      .setFooter(`Maestria ${masteryReq}`, masteryRankImgs[masteryReq || 0]);
    return embed;
  }

  private get bpSource() {
    return blueprintSource(this.warframe);
  }

  public mainInfoPage() {
    const { warframe, bpSource } = this;
    const {
      components = [], health, armor, shield, power, sprintSpeed,
    }: Item = warframe;
    const embed = this.baseEmbed;
    embed.addField('Status', `Vida: ${health}\nArmadura: ${armor}\nEscudo: ${shield}\n`
      + `Energia: ${power}\nVelocidade de corrida: ${sprintSpeed}`, false);

    const [
      resources,
      componentItems,
    ] = biFilter<Component>(components.filter(({ name }) => name !== 'Blueprint'),
      ({ uniqueName }: Item) => (
        uniqueName.includes('Items')));

    if ('location' in bpSource && 'id' in bpSource) {
      const blueprintString = bpSource.id === 1
        ? `${bpSource.location} Lab: ${bpSource.lab}`
        : `${bpSource.location}`;
      embed.addField('Blueprint', blueprintString, false);
    }

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
