import { Event } from 'klasa';

import type { EventStore } from 'klasa';
import type { VoiceConnection, VoiceState } from 'discord.js';
import AudioRecorder from '../../../customExtendables/audioRecorder';

const recorderMap = new Map();

export default class extends Event {
  constructor(...args: [EventStore, string[], string]) {
    super(...args, {
      event: 'botJoinedChannel',
      enabled: true,
      once: false,
    });
  }

  async run({ state }: { state: VoiceState }) {
    if (recorderMap.has(state.guild.id)) {
      const oldAudioRecorder = recorderMap.get(state.guild.id);
      await oldAudioRecorder.stopRecording();
      recorderMap.delete(state.guild.id);
    }

    const newRecorder = new AudioRecorder(state.connection as VoiceConnection, this.client);
    recorderMap.set(state.guild.id, newRecorder);
    await newRecorder.startRecording();
  }
}
