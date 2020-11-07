import { Task, TaskOptions } from '@lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { SnowflakeUtil } from 'discord.js';

import type { Guild } from 'discord.js';

@ApplyOptions<TaskOptions>({ time: 10000, once: true })
export default class extends Task {
  public async run() {
    // Cache active bot voice connections
    const clientId = this.client.user?.id || '';
    await new Promise((resolve) => {
      this.client.guilds.cache.each(async (guild: Guild) => {
        const voiceChannels = guild.channels.cache.filter(({ type }) => type === 'voice');
        await voiceChannels.each(async (voiceChannel) => {
          const { members } = voiceChannel;
          if (!members.has(clientId)) return;
          const guildMember = await members.get(clientId)?.fetch();
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
    setTimeout(() => this.client.emit('initialTasksCompleted'), 500);
  }
}
