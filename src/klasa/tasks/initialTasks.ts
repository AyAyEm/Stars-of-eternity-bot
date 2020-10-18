import { Task } from 'klasa';
import { SnowflakeUtil } from 'discord.js';

import type { TaskStore } from 'klasa';
import type { Guild } from 'discord.js';

export default class extends Task {
  constructor(...args: [TaskStore, string[], string]) {
    super(...args, { enabled: true });
  }

  async init() {
    // Cache active bot voice connections
    const clientID = this.client.user?.id || '';
    await new Promise((resolve) => {
      this.client.guilds.cache.each(async (guild: Guild) => {
        const voiceChannels = guild.channels.cache.filter(({ type }) => type === 'voice');
        await voiceChannels.each(async (voiceChannel) => {
          const { members } = voiceChannel;
          if (!members.has(clientID)) return;
          const guildMember = await members.get(clientID)?.fetch();
          const clientVoiceConnection = guildMember?.voice.connection;
          // If the client is in a channel and doesn't have a connection we'll kick it.
          if (!clientVoiceConnection) {
            guildMember?.voice.kick('Server restart auto bot kick');
            return;
          }
          const snowflake = SnowflakeUtil.generate();
          this.client.voice?.connections.set(snowflake, clientVoiceConnection);
        });
        resolve();
      });
    });
    this.client.voice?.connections.each((voiceConnection) => voiceConnection.disconnect());
    setTimeout(() => this.client.emit('initialTasksCompleted'), 1000);
  }

  run() { }
}
