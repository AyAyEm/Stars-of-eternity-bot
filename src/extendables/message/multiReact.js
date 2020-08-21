const { Extendable, KlasaMessage } = require('klasa');
const async = require('async');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [KlasaMessage],
    });
  }

  async multiReact(emojis) {
    let [stop, iteration] = [false, 0];
    const stopReactions = () => { stop = true; };
    const emojisIterator = emojis.values();
    const reactionLoop = async.until(async () => stop || iteration >= emojis.length, async () => {
      iteration += 1;
      return (await this.react(emojisIterator.next().value)).fetch();
    });
    return { reactionLoop, stopReactions };
  }
};
