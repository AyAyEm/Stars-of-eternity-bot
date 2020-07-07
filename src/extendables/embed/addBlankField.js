const { Extendable } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [MessageEmbed],
    });
  }

  addBlankField() {
    return this.addField('\u200b', '\u200b');
  }
};
