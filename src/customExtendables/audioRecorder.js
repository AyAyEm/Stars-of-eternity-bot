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
    .replace(/:/g, '_')
    .replace(/ /g, '');
  const dateFormater = new Intl.DateTimeFormat(language, options);
  return {
    startToEndDate: () => {
      const endingDate = new Date();
      return invalidCaractersReplace(dateFormater.formatRange(startDate, endingDate));
    },
    startDate: invalidCaractersReplace(dateFormater.format(startDate)),
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
    const audioDateObject = audioDate();
    this.voiceConnection = voiceConnection;
    this.client = client;
    this.channel = voiceConnection.channel;
    const idPath = `.\\audios\\${audioDateObject.startDate}.ogg`;
    this.outputStream = fs.createWriteStream(idPath);
    this.fileRename = (() => {
      const { startToEndDate } = audioDateObject;
      return async () => {
        await fs.promises.rename(idPath, `.\\audios\\${startToEndDate()}.ogg`);
      };
    })();
    this.pcmMixer = new AudioMixer.Mixer({
      ...voiceInputOptions,
      clearInterval: 100,
    });
    this.isRecording = false;
  }

  async startRecording() {
    if (this.isRecording) {
      await this.stopRecording();
    }
    this.isRecording = true;
    const {
      voiceConnection, client, channel, outputStream, fileRename, pcmMixer,
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
    const memberJoinEventPath = `${voiceConnection.channel.id}memberJoined`;
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
      .on('end', fileRename)
      .pipe(outputStream);
    voiceConnection.on('disconnect', async () => this.stopRecording());
  }

  async stopRecording() {
    this.pcmMixer.emit('end');
    this.pcmMixer.close();
    this.pcmMixer.removeAllListeners();
    this.pcmMixer.destroy();
    this.isRecording = false;
  }
};
