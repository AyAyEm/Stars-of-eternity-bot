const { Event } = require('klasa');
const AudioRecorder = require('../../customExtendables/audioRecorder');

const recorderMap = new Map();

module.exports = class extends Event {
  constructor(...args) {
    super(...args, {
      event: 'botJoinedChannel',
      enabled: true,
      once: false,
    });
  }

  async run({ state }) {
    if (recorderMap.has(state.guild.id)) {
      const oldAudioRecorder = recorderMap.get(state.guild.id);
      await oldAudioRecorder.stopRecording();
      recorderMap.delete(state.guild.id);
    }
    const newRecorder = new AudioRecorder(state.connection, this.client);
    recorderMap.set(state.guild.id, newRecorder);
    await newRecorder.startRecording();
  }
};
