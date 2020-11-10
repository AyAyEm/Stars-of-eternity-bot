import * as AudioMixer from 'audio-mixer';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fse from 'fs-extra';

import type { VoiceConnection, VoiceChannel, GuildMember } from 'discord.js';
import type { WriteStream } from 'fs';

import type { EternityClient } from '@lib';
import { SilenceStream } from './silenceStream';
import { audioDate } from './audioDate';

ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
ffmpeg.setFfprobePath(require('@ffprobe-installer/ffprobe').path);

export class AudioRecorder {
  protected voiceInputOptions = {
    channels: 2,
    bitDepth: 16,
    sampleRate: 48000,
  };

  public client: EternityClient;

  protected pcmMixer = new AudioMixer.Mixer(this.voiceInputOptions);

  protected channel: VoiceChannel;

  public audioDateObject = audioDate();

  public readonly basePath = './audios/';

  public readonly audioPath = `${this.basePath}${this.audioDateObject.startDate}.ogg`;

  public readonly logPath = `${this.basePath}${this.audioDateObject.startDate}.txt`;

  protected isRecording = false;

  protected outputAudioStream?: WriteStream;

  protected outputLogStream?: WriteStream;

  protected removeListeners: Array<() => void> = [];

  constructor(public voiceConnection: VoiceConnection) {
    this.channel = voiceConnection.channel;
    this.client = voiceConnection.client as EternityClient;
  }

  async assignVoiceConnection(member: GuildMember) {
    const { voiceConnection, pcmMixer } = this;
    const voiceStream = voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
    const standaloneInput = new AudioMixer.Input({ ...this.voiceInputOptions, volume: 100 });
    pcmMixer.addInput(standaloneInput);
    voiceStream.pipe(standaloneInput);
  }

  async startRecording() {
    if (this.isRecording) await this.stopRecording();

    await this.channelLogger();
    this.isRecording = true;
    this.outputAudioStream = fse.createWriteStream(this.audioPath);

    this.voiceConnection.play(new SilenceStream(), { type: 'opus' });
    this.channel.members.array().forEach(async (member, i) => {
      const voiceStream = this.voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
      if (i === 0) {
        const mixerInput = this.pcmMixer.input({ ...this.voiceInputOptions, volume: 100 });
        return voiceStream.pipe(mixerInput);
      }
      return this.assignVoiceConnection(member);
    });

    const memberJoinEventPath = `${this.channel.id}memberJoined`;
    const memberJoinEventHandler = async (member: GuildMember) => {
      if (member.guild.id !== this.voiceConnection.channel.guild.id) return;
      await this.assignVoiceConnection(member);
    };
    this.client.on(memberJoinEventPath, memberJoinEventHandler);
    this.removeListeners.push(() => (
      this.client.removeListener(memberJoinEventPath, memberJoinEventHandler)));

    ffmpeg(this.pcmMixer)
      .inputOptions(['-f s16le', '-acodec pcm_s16le', '-ac 2', '-ar 48000'])
      .audioQuality(24)
      .audioChannels(1)
      .audioCodec('opus')
      .format('opus')
      .on('error', this.client.console.error)
      .on('end', async () => {
        const { startToEndDate } = this.audioDateObject;
        await fse.rename(this.audioPath, `${this.basePath}${startToEndDate()}.ogg`);
        await fse.rename(this.logPath, `${this.basePath}${startToEndDate()}.txt`);
      })
      .pipe(this.outputAudioStream);
    this.voiceConnection.on('disconnect', this.stopRecording);
    this.removeListeners.push(() => this.client.removeListener('disconnect', this.stopRecording));
  }

  async stopRecording() {
    if (this.pcmMixer) {
      this.pcmMixer.emit('end');
      this.pcmMixer.close();
      this.pcmMixer.removeAllListeners();
      this.pcmMixer.destroy();
    }
    this.removeListeners.forEach((removeFn) => removeFn());
    this.outputLogStream?.end();
    this.isRecording = false;
  }

  async channelLogger() {
    const { channel } = this;
    this.outputLogStream = fse.createWriteStream(this.logPath);
    const { outputLogStream } = this;

    const startString = [
      `Recording started at: ${this.audioDateObject.newDate()} `,
      `with ${this.channel.members.keyArray().length - 1} member, `,
      `in the channel: [${channel.name}]:[${channel.id}], `,
      `in the guild: [${channel.guild.name}]:[${channel.guild.id}]\n`,
      ' With the following members:\n',
    ].join();

    const startLog = channel.members.array().reduce((string, member) => {
      if (member.user.id === this.client.user?.id) return string;
      const newString = `${string}`
        + ` -NickName[${member.nickname}]:UserName:[${member.user.tag}]\n`;
      return newString;
    }, startString);
    outputLogStream.write(startLog);

    const eventJoinPath = `${channel.id}memberJoined`;
    const eventJoinHandler = async (member: GuildMember) => {
      const string = `[${this.audioDateObject.newDate()}]  :[Member joined]: `
        + `NickName[${member.nickname}]: `
        + `UserName[${member.user.tag}]:\n`;
      outputLogStream.write(string);
    };
    this.client.on(eventJoinPath, eventJoinHandler);
    this.removeListeners.push(() => (
      this.client.removeListener(eventJoinPath, eventJoinHandler)));

    const eventLeftPath = `${channel.id}memberLeft`;
    const eventLeftHandler = async (member: GuildMember) => {
      const string = `[${this.audioDateObject.newDate()}]  :[Member left]: `
        + `NickName[${member.nickname}]: `
        + `UserName[${member.user.tag}]\n`;
      outputLogStream.write(string);
    };
    this.client.on(`${channel.id}memberLeft`, eventLeftHandler);
    this.removeListeners.push(() => (
      this.client.removeListener(eventLeftPath, eventLeftHandler)));
  }
}
