import { MessageEmbed } from 'discord.js';

export class EternityMessageEmbed extends MessageEmbed {
  public static blankField = { name: '\u200b', value: '\u200b' };

  public addBlankField(inline = false) {
    const { name, value } = EternityMessageEmbed.blankField;
    return this.addField(name, value, inline);
  }
}
