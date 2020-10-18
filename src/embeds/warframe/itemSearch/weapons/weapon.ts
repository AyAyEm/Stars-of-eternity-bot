import _ from 'lodash';

import type { Item, Component } from 'warframe-items';

import BaseWeapon from './baseWeapon';
import { blueprintSource, dropToNameAndChance } from '../utils';
import { biFilter } from '../../../../utils';
import specialItems from '../specialItems';

class WeaponEmbed extends BaseWeapon {
  constructor(public weapon: Item) {
    super(weapon);
  }

  get bpSource() {
    return blueprintSource(this.weapon);
  }

  get mainInfoPage() {
    const { weapon, bpSource, baseEmbed: embed } = this;
    const { name: weaponName } = weapon;
    const specialAdjustment = specialItems.get(weaponName);

    if (specialAdjustment) {
      return specialAdjustment(embed);
    }

    const components = weapon.components || [];
    const [resources, componentItems] = biFilter(components.filter(
      ({ name }: Component) => name !== 'Blueprint',
    ), ({ uniqueName }: Component) => (
      uniqueName.includes('Items')));

    if ('id' in bpSource && 'location' in bpSource) {
      const blueprintString = bpSource.id === 1
        ? `${bpSource.location} Lab: ${bpSource.lab}`
        : `${bpSource.location}`;
      embed.addField('Blueprint', blueprintString, false);
    }

    if (componentItems.length > 0) {
      const componentsString = componentItems
        .map(({ name, itemCount }: Component) => `${name} **${itemCount}**`)
        .join('\n');
      embed.addField('Componentes', componentsString, false);
    }

    if (resources.length > 0) {
      const resourcesNames = resources.map(({ name: resourceName, itemCount }: Component) => (
        `${resourceName} **${itemCount}**`));
      const resourcesString = resourcesNames.join('\n');
      embed.addField('Recursos', resourcesString, false);
    }
    return embed;
  }

  get componentsPage() {
    const { weapon, baseEmbed, bpSource } = this;
    const { components } = weapon;

    if (!('location' in bpSource) || bpSource.location !== 'Drop') return null;
    if (!components) return null;

    const [resources, componentItems] = biFilter(components, ({ uniqueName }: Component) => (
      uniqueName.includes('Items')));
    const componentsFields = componentItems.map(({ drops, name }: Component) => {
      const nameAndChance = _.uniqBy(drops, 'location')
        .map((drop) => dropToNameAndChance(drop))
        .sort(({ chance: A }, { chance: B }) => B - A)
        .slice(0, 3);
      const dataString = nameAndChance
        .map(({ name: enemyName, chance }) => `${enemyName} **${Math.round(chance * 100) / 100}%**`)
        .join('\n');
      return { name, value: dataString, inline: false };
    });
    baseEmbed.addFields(componentsFields);

    if (resources.length > 0) {
      const resourcesString = resources
        .map(({ name, itemCount }: Component) => `${name} **${itemCount}**`)
        .join('\n');
      baseEmbed.addField('Recursos', resourcesString, false);
    }

    return baseEmbed;
  }
}

export function weaponFn(item: Item) {
  const weaponEmbed = new WeaponEmbed(item);
  const { mainInfoPage, componentsPage, baseStatusEmbed } = weaponEmbed;
  const embedMap = new Map();
  embedMap.set('📋', mainInfoPage);
  if (componentsPage) embedMap.set('♻', componentsPage);
  embedMap.set('🃏', baseStatusEmbed);
  return embedMap;
}
