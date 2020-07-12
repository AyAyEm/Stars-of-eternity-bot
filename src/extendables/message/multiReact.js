const { Extendable, KlasaMessage } = require('klasa');
const { eachSeries } = require('async');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [KlasaMessage],
    });
  }

  async multiReact(emojis) {
    let stop = false;
    const stopReactions = () => { stop = true; };
    const reactionLoop = eachSeries(emojis, async (emoji) => {
      if (!stop) return (await this.react(emoji)).fetch();
      return undefined;
    });
    return { reactionLoop, stopReactions };
  }
};
