import { Task } from 'klasa';

import type { TaskStore } from 'klasa';

export default class extends Task {
  constructor(...args: [TaskStore, string[], string]) {
    super(...args, { enabled: true });
  }

  async init() {
    const { Guilds }: any = await this.client.providers.get('mongoose');
    this.client.guilds.cache.each(async (guild, guildID) => {
      const exists = await Guilds.exists({ id: guildID });
      if (!exists) {
        const guildDocument = new Guilds({ id: guildID, name: guild.name });
        guildDocument.save();
      }
    });
  }

  run() { }
}
