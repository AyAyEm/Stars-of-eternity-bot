import type { EternityVoiceChannel } from '@lib';

let executing = false;
export function toJoinChannel(channel: EternityVoiceChannel) {
  if (executing) return;
  executing = true;

  const { guild } = channel;
  const clientConnections = channel.client.voice?.connections;
  const botVoiceConnection = clientConnections?.array().length === 0
    ? null
    : clientConnections
      ?.filter((voiceConnection) => voiceConnection.channel.guild.id === guild.id)
      .first();
  const botChannel = botVoiceConnection ? botVoiceConnection.channel : null;
  const channelWithMostUsers = guild.channelWithMostMembers;
  if (channelWithMostUsers.members.size <= 0) {
    if (botChannel) botChannel.leave();
    executing = false;
    return;
  }

  if (!botChannel) {
    channelWithMostUsers.join();
    executing = false;
    return;
  }

  if (channelWithMostUsers.id === botChannel.id) {
    executing = false;
    return;
  }

  botVoiceConnection?.emit('endRecording');
  channelWithMostUsers.join();
  executing = false;
}
