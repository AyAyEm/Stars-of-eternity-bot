const { Task } = require('klasa');
const Snowflake = require('discord.js/src/util/Snowflake');

module.exports = class extends Task {
  constructor(...args) {
    super(...args, { enabled: true });
  }

  async init() {
    const { client } = this;
    // Cache active bot voice connections
    const clientID = client.user.id;
    await new Promise((resolve) => {
      client.guilds.cache.each(async (guild) => {
        const { voiceChannels } = guild;
        await voiceChannels.each(async (voiceChannel) => {
          const { members } = voiceChannel;
          if (!members.has(clientID)) return;
          const guildMember = await members.get(clientID).fetch();
          const clientVoiceConnection = guildMember.voice.connection;
          // If the client is in a channel and doesn't have a connection we'll kick it.
          if (!clientVoiceConnection) {
            guildMember.voice.kick('Server restart auto bot kick');
            return;
          }
          const snowflake = Snowflake.generate();
          client.voice.connections.set(snowflake, clientVoiceConnection);
        });
        resolve();
      });
    });
    client.voice.connections.each((voiceConnection) => voiceConnection.disconnect());
    setTimeout(() => client.emit('initialTasksCompleted'), 1000);
  }
};
