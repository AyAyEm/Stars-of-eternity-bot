import { EternityEvent } from '@lib';
import { ApplyOptions } from '@sapphire/decorators';
import { AudioRecorder } from '@lib/eternity';

import type { EventOptions } from '@sapphire/framework';
import type { Channel, VoiceState } from 'discord.js';

@ApplyOptions<EventOptions>({ event: 'clientJoinedChannel' })
export default class extends EternityEvent<'clientJoinedChannel'> {
  public recorders: Map<string, AudioRecorder> = new Map();

  async run(_channel: Channel, state: VoiceState) {
    if (this.recorders.has(state.guild.id)) {
      const oldAudioRecorder = this.recorders.get(state.guild.id);
      await oldAudioRecorder.stopRecording();
      this.recorders.delete(state.guild.id);
    }

    const recorder = new AudioRecorder(state.connection, this.client);
    this.recorders.set(state.guild.id, recorder);
    recorder.startRecording();
  }
}
