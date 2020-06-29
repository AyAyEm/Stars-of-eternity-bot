/* eslint-disable max-classes-per-file */
const { Readable } = require('stream');
const AudioMixer = require('audio-mixer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { config } = require('../config');

ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
ffmpeg.setFfprobePath(require('@ffprobe-installer/ffprobe').path);

const audioDate = () => {
  const startDate = new Date();
  const { language, timezone } = config;
  const options = {
    dateStyle: 'short',
    timeStyle: 'medium',
    fractionalSecondDigits: '2',
    timeZone: timezone,
  };
  const invalidCaractersReplace = (stringDate) => stringDate
    .replace(' ', 'T')
    .replace(/\//g, '_')
    .replace(/:/g, '_')
    .replace(/ /g, '');
  const dateFormater = new Intl.DateTimeFormat(language, options);
  return {
    startToEndDate: () => {
      const endingDate = new Date();
      return invalidCaractersReplace(dateFormater.formatRange(startDate, endingDate));
    },
    startDate: invalidCaractersReplace(dateFormater.format(startDate)),
    newDate: () => dateFormater.format(new Date()),
  };
};
const silenceFrame = Buffer.from([0xF8, 0xFF, 0xFE]);
class Silence extends Readable {
  // eslint-disable-next-line no-underscore-dangle
  _read() {
    this.push(silenceFrame);
  }
}
const voiceInputOptions = {
  channels: 2,
  bitDepth: 16,
  sampleRate: 48000,
};
const assignVoiceConnection = (voiceConnection, member, pcmMixer) => {
  const voiceStream = voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
  const standaloneInput = new AudioMixer.Input({ ...voiceInputOptions, volume: 100 });
  pcmMixer.addInput(standaloneInput);
  voiceStream.pipe(standaloneInput);
};

module.exports = class AudioRecorder {
  constructor(voiceConnection, client) {
    this.audioDateObject = audioDate();
    this.voiceConnection = voiceConnection;
    this.client = client;
    this.channel = voiceConnection.channel;
    const audioPath = `./audios/${this.audioDateObject.startDate}.ogg`;
    const logPath = `./audios/${this.audioDateObject.startDate}.txt`;
    this.outputAudioStream = fs.createWriteStream(audioPath);
    this.outputLogStream = fs.createWriteStream(logPath);
    const { startToEndDate } = this.audioDateObject;
    const fileRename = async (actualPath, newPath) => fs.promises.rename(actualPath, newPath);
    this.audioRename = async () => fileRename(audioPath, `./audios/${startToEndDate()}.ogg`);
    this.logRename = async () => fileRename(logPath, `./audios/${startToEndDate()}.txt`);
    this.pcmMixer = new AudioMixer.Mixer({
      ...voiceInputOptions,
      clearInterval: 100,
    });
    this.isRecording = false;
  }

  async startRecording() {
    await this.channelLogger();
    if (this.isRecording) {
      await this.stopRecording();
    }
    this.isRecording = true;
    const {
      voiceConnection, client, channel, outputAudioStream, audioRename, pcmMixer,
    } = this;
    voiceConnection.play(new Silence(), { type: 'opus' });
    channel.members.array().forEach((member, i) => {
      const voiceStream = voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
      if (i === 0) {
        const mixerInput = pcmMixer.input({ ...voiceInputOptions, volume: 100 });
        return voiceStream.pipe(mixerInput);
      }
      return assignVoiceConnection(voiceConnection, member, pcmMixer);
    });
    const memberJoinEventPath = `${channel.id}memberJoined`;
    client.on(memberJoinEventPath, async (member) => {
      if (member.guild.id !== voiceConnection.channel.guild.id) return;
      assignVoiceConnection(voiceConnection, member, pcmMixer);
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
    this.outputLogStream.end();
    this.isRecording = false;
  }

  async channelLogger() {
    const {
      outputLogStream, client, channel, audioDateObject: { newDate },
    } = this;
    const startString = `Recording started at: ${newDate()} `
      + `with ${channel.members.keyArray().length - 1} member, `
      + `in the channel: [${channel.name}]:[${channel.id}], `
      + `in the guild: [${channel.guild.name}]:[${channel.guild.id}]\n`
      + ' With the following members:\n';
    const startLog = channel.members.array().reduce((string, member) => {
      if (member.user.id === client.user.id) return string;
      const newString = `${string}`
        + ` -NickName[${member.nickname}]:UserName:[${member.user.tag}]\n`;
      return newString;
    }, startString);
    outputLogStream.write(startLog);
    client.on(`${channel.id}memberJoined`, async (member) => {
      const string = `[${newDate()}]  :[Member joined]: `
        + `NickName[${member.nickname}]: `
        + `UserName[${member.user.tag}]:\n`;
      outputLogStream.write(string);
    });
    client.on(`${channel.id}memberLeft`, async (member) => {
      const string = `[${newDate()}]  :[Member left]: `
        + `NickName[${member.nickname}]: `
        + `UserName[${member.user.tag}]\n`;
      outputLogStream.write(string);
    });
    outputLogStream.on('end', () => {
      this.logRename();
    });
  }
};
