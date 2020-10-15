import { Event } from 'klasa';
import type { EventStore } from 'klasa';
import type { Guild, GuildMember, VoiceChannel } from 'discord.js';

export default class extends Event {
  constructor(...args: [EventStore, string[], string]) {
    super(...args, {
      event: 'botFollowMembers',
      enabled: true,
      once: false,
    });
  }

  async init() {
    function getChannelWithMostUsers(guild: Guild) {
      const guildChannels = guild.channels.cache;
      const voiceChannels = guildChannels.filter((channel) => channel.type === 'voice');

      type Result = VoiceChannel | undefined | null;
      return voiceChannels
        .map((channel) => {
          const userCount = channel.members
            .filter((member: GuildMember) => !member.user.bot)
            .keyArray().length;

          return { userCount, channel };
        })
        .sort(({ userCount: A }, { userCount: B }) => B - A)[0].channel as Result;
    }

    let executing = false;
    const toJoinChannel = async (guild: Guild) => {
      if (executing) return;
      executing = true;

      const clientConnections = this.client.voice?.connections;
      const botVoiceConnection = clientConnections?.array().length === 0
        ? null
        : clientConnections
          ?.filter((voiceConnection) => voiceConnection.channel.guild.id === guild.id)
          .first();
      const botChannel = botVoiceConnection ? botVoiceConnection.channel : null;
      const channelWithMostUsers = await getChannelWithMostUsers(guild);
      if (!channelWithMostUsers) {
        if (botChannel) await botChannel.leave();
        executing = false;
        return;
      }

      if (!botChannel) {
        await channelWithMostUsers.join();
        executing = false;
        return;
      }

      if (channelWithMostUsers.id === botChannel.id) {
        executing = false;
        return;
      }

      botVoiceConnection?.emit('endRecording');
      await channelWithMostUsers.join();
      executing = false;
    };

    (this.client as any).once('initialTasksCompleted', async () => {
      this.client.guilds.cache.each((guild) => toJoinChannel(guild));
      (this.client as any)
        .on('memberJoinedChannel', async ({ member }: { member: GuildMember }) => toJoinChannel(member.guild));
      (this.client as any)
        .on('memberLeftChannel', async ({ member }: { member: GuildMember }) => toJoinChannel(member.guild));
    });
  }

  run() { }
};
