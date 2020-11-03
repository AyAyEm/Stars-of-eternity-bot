import { Task, TaskOptions } from '@lib/structures';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<TaskOptions>({
  time: 10000,
  once: true,
})
export default class extends Task {
  public async run() {
    const { Guilds } = this.client.provider.models;
    this.client.guilds.cache.each(async (guild, guildId) => {
      const exists = await Guilds.exists({ id: guildId });
      if (!exists) {
        const guildDocument = new Guilds({ id: guildId, name: guild.name });
        guildDocument.save();
      }
    });
  }
}
