const { Extendable, KlasaMessage } = require('klasa');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [KlasaMessage],
    });
  }

  async multiReact(emojis) {
    return Promise.all(emojis.map(async (emoji) => this.react(emoji)));
  }
};
