import type { MessageEmbed } from 'discord.js';
import { blankField } from './';

export function addBlankField(embed: InstanceType<typeof MessageEmbed>, inline = false) {
  return embed.addField(blankField.name, blankField.value, inline);
}