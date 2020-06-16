const { Extendable } = require('klasa');
const { Message } = require('discord.js');
const { extandablesConfig: { replyAndDeleteTimeout: defaultTimeout } } = require('../config');

module.exports = class extends Extendable {
  constructor(...args) {
    super(...args, {
      enabled: true,
      appliesTo: [Message],
    });
  }

  replyAndDelete(replyText, timeout = defaultTimeout, both = true) {
    const msg = this;
    msg.reply(replyText)
      .then((replyMsg) => {
        replyMsg.delete({ timeout });
        if (both) msg.delete({ timeout });
      });
  }
};
