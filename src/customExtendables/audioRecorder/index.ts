import AudioMixer from 'audio-mixer';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

import { SilenceStream } from './silenceStream';
import { audioDate } from './audioDate';

import type { VoiceConnection, VoiceChannel, GuildMember } from 'discord.js';
import type { KlasaClient } from 'klasa';
import type { Mixer } from 'audio-mixer';
import type { WriteStream} from 'fs';

ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
ffmpeg.setFfprobePath(require('@ffprobe-installer/ffprobe').path);

export default class AudioRecorder {
  protected voiceInputOptions = {
    channels: 2,
    bitDepth: 16,
    sampleRate: 48000,
  };

  protected audioDateObject: ReturnType<typeof audioDate>;

  protected channel: VoiceChannel;

  protected basePath: string;

  protected audioPath: string;

  protected logPath: string;

  protected checkFolder: () => void;

  protected audioRename: () => Promise<void>;

  protected logRename: () => Promise<void>;

  protected pcmMixer: Mixer;

  protected isRecording: boolean;

  protected outputAudioStream?: WriteStream;

  protected outputLogStream?: WriteStream;

  constructor(public voiceConnection: VoiceConnection, public client: KlasaClient) {
    this.audioDateObject = audioDate();
    this.channel = voiceConnection.channel;
    this.basePath = './audios/';
    this.audioPath = `${this.basePath}${this.audioDateObject.startDate}.ogg`;
    this.logPath = `${this.basePath}${this.audioDateObject.startDate}.txt`;
    const { basePath, audioPath, logPath } = this;
    const createFolder = async () => fs.promises.mkdir(basePath, { recursive: true });
    this.checkFolder = async () => {
      try { await fs.promises.access(basePath); } catch {
        await createFolder();
      }
    };
    const { startToEndDate } = this.audioDateObject;

    async function fileRename(actualPath: string, newPath: string) {
      return fs.promises.rename(actualPath, newPath);
    }

    this.audioRename = async () => fileRename(audioPath, `${basePath}${startToEndDate()}.ogg`);
    this.logRename = async () => fileRename(logPath, `${basePath}${startToEndDate()}.txt`);
    this.pcmMixer = new AudioMixer.Mixer(this.voiceInputOptions);
    this.isRecording = false;
  }

  async startRecording() {
    if (this.isRecording) {
      await this.stopRecording();
    }
    await this.checkFolder();
    await this.channelLogger();
    this.isRecording = true;
    const {
      audioPath, voiceConnection, client, channel, audioRename, pcmMixer, assignVoiceConnection,
    } = this;
    this.outputAudioStream = fs.createWriteStream(audioPath);
    const { outputAudioStream } = this;
    voiceConnection.play(new SilenceStream(), { type: 'opus' });
    channel.members.array().forEach(async (member, i) => {
      const voiceStream = voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
      if (i === 0) {
        const mixerInput = pcmMixer.input({ ...this.voiceInputOptions, volume: 100 });
        return voiceStream.pipe(mixerInput);
      }
      return assignVoiceConnection.call(this, member);
    });
    const memberJoinEventPath = `${channel.id}memberJoined`;
    client.on(memberJoinEventPath, async (member) => {
      if (member.guild.id !== voiceConnection.channel.guild.id) return;
      await assignVoiceConnection.call(this, member);
    });
    ffmpeg(pcmMixer)
      .inputOptions(['-f s16le', '-acodec pcm_s16le', '-ac 2', '-ar 48000'])
      .audioQuality(24)
      .audioChannels(1)
      .audioCodec('opus')
      .format('opus')
      .on('error', client.console.error)
      .on('end', async () => {
        await audioRename();
        await this.logRename();
      })
      .pipe(outputAudioStream);
    voiceConnection.on('disconnect', async () => this.stopRecording());
  }

  async stopRecording() {
    this.pcmMixer.emit('end');
    this.pcmMixer.close();
    this.pcmMixer.removeAllListeners();
    this.pcmMixer.destroy();
    this.client.removeAllListeners(`${this.channel.id}memberJoined`);
    this.client.removeAllListeners(`${this.channel.id}memberLeft`);
    this.outputLogStream?.end();
    this.isRecording = false;
  }

  async channelLogger() {
    const {
      logPath, channel, audioDateObject: { newDate },
    } = this;
    this.outputLogStream = fs.createWriteStream(logPath);
    const { outputLogStream } = this;
    const startString = `Recording started at: ${newDate()} `
      + `with ${channel.members.keyArray().length - 1} member, `
      + `in the channel: [${channel.name}]:[${channel.id}], `
      + `in the guild: [${channel.guild.name}]:[${channel.guild.id}]\n`
      + ' With the following members:\n';
    const startLog = channel.members.array().reduce((string, member) => {
      if (member.user.id === this.client.user?.id) return string;
      const newString = `${string}`
        + ` -NickName[${member.nickname}]:UserName:[${member.user.tag}]\n`;
      return newString;
    }, startString);
    outputLogStream.write(startLog);
    this.client.on(`${channel.id}memberJoined`, async (member) => {
      const string = `[${newDate()}]  :[Member joined]: `
        + `NickName[${member.nickname}]: `
        + `UserName[${member.user.tag}]:\n`;
      outputLogStream.write(string);
    });
    this.client.on(`${channel.id}memberLeft`, async (member) => {
      const string = `[${newDate()}]  :[Member left]: `
        + `NickName[${member.nickname}]: `
        + `UserName[${member.user.tag}]\n`;
      outputLogStream.write(string);
    });
    outputLogStream.on('end', () => {
      this.logRename();
    });
  }

  async assignVoiceConnection(member: GuildMember) {
    const { voiceConnection, pcmMixer } = this;
    const voiceStream = voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
    const standaloneInput = new AudioMixer.Input({ ...this.voiceInputOptions, volume: 100 });
    pcmMixer.addInput(standaloneInput);
    voiceStream.pipe(standaloneInput);
  }
};
