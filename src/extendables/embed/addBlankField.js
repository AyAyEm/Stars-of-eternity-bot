const { Extendable } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [MessageEmbed],
    });
  }

  static get blankField() {
    return { name: '\u200b', value: '\u200b' };
  }

  addBlankField(inline = false) {
    return this.addField('\u200b', '\u200b', inline);
  }
};
