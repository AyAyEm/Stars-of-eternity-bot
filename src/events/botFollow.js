/* eslint-disable max-classes-per-file */
const { Event } = require('klasa');
const audioRecorder = require('../customExtendables/audioRecorder');

module.exports = class extends Event {
  constructor(...args) {
    super(...args, {
      event: 'voiceStateUpdate',
      enabled: true,
      once: false,
    });
  }

  async run(oldState, newState) {
    const guildDocument = await this.client.providers.get('mongoose')
      .guildDocument(oldState.guild.id);
    const member = oldState ? oldState.member : newState.member;
    const isToFollow = guildDocument.get(`members.${member.id}.toFollow`);
    if (!isToFollow) return;
    const [oldChannel, newChannel] = [oldState.channel, newState.channel];
    if (!newChannel) {
      oldChannel.leave();
    } else {
      // const dropbox = await this.client.clouds.dropbox;
      newChannel.join().then(async (voiceConnection) => {
        await audioRecorder(voiceConnection, member);
      });
      // const uploadStream = dropbox({
      //   resource: 'files/upload',
      //   parameters: { path: '/target/file/path.pcm' },
      // });
    }
  }
};
