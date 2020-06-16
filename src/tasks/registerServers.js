const { Task } = require('klasa');

module.exports = class extends Task {
  constructor(...args) {
    super(...args, { enabled: true });
  }

  async init() {
    const { Guilds } = await this.client.providers.get('mongoose');
    this.client.guilds.cache.each(async (guild, guildID) => {
      const exists = await Guilds.exists({ id: guildID });
      if (!exists) {
        const guildDocument = new Guilds({ id: guildID, name: guild.name });
        guildDocument.save();
      }
    });
  }
};
