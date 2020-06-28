const { Event } = require('klasa');

module.exports = class extends Event {
  constructor(...args) {
    super(...args, {
      enabled: true,
      once: false,
    });
  }

  async init() {
    const getChannelWithMostUsers = async (guild) => {
      const guildChannels = guild.channels.cache;
      const voiceChannels = guildChannels.filter((channel) => channel.type === 'voice');
      return voiceChannels.reduce((finalChannel, channel) => {
        const onlyPersons = (member) => !member.user.bot;
        const finalLength = finalChannel.members.filter(onlyPersons).keyArray().length;
        const actualLength = channel.members.filter(onlyPersons).keyArray().length;
        if (finalLength === 0 && actualLength === 0) {
          return null;
        }
        return finalLength <= actualLength ? channel : finalChannel;
      });
    };
    let executing = false;
    const toJoinChannel = async (guild) => {
      if (executing) return;
      executing = true;
      const clientConnections = this.client.voice.connections;
      const botVoiceConnection = clientConnections.array().length === 0
        ? null
        : clientConnections
          .filter((voiceConnection) => voiceConnection.channel.guild.id === guild.id)
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
      botVoiceConnection.emit('endRecording');
      await channelWithMostUsers.join();
      executing = false;
    };
    this.client.once('initialTasksCompleted', async () => {
      this.client.guilds.cache.each((guild) => toJoinChannel(guild));
    });
    this.client.on('memberJoinedChannel', async ({ member }) => toJoinChannel(member.guild));
    this.client.on('memberLeftChannel', async ({ member }) => toJoinChannel(member.guild));
  }
};
