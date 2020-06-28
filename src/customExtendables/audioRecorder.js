const { Readable } = require('stream');
const AudioMixer = require('audio-mixer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const _ = require('lodash');
const { config } = require('../config');

ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
ffmpeg.setFfprobePath(require('@ffprobe-installer/ffprobe').path);

const audioName = () => {
  const startDate = new Date();
  const { language, timezone } = config;
  const options = {
    dateStyle: 'short',
    timeStyle: 'medium',
    fractionalSecondDigits: '2',
    timeZone: timezone,
  };
  const dateFormater = new Intl.DateTimeFormat(language, options);
  return () => {
    const endingDate = new Date();
    return dateFormater.formatRange(startDate, endingDate)
      .replace(' ', 'T')
      .replace(/:/g, '_')
      .replace(/ /g, '');
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

module.exports = async (voiceConnection, client) => {
  const { channel } = voiceConnection;
  const idPath = `.\\audios\\${_.uniqueId('audio_')}.ogg`;
  const outputStream = fs.createWriteStream(idPath);
  const fileRename = (() => {
    const fileName = audioName();
    return async () => {
      await fs.promises.rename(idPath, `.\\audios\\${fileName()}.ogg`);
    };
  })();
  const pcmMixer = new AudioMixer.Mixer({
    ...voiceInputOptions,
    clearInterval: 250,
  });
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
  voiceConnection.on('endRecording', async () => {
    pcmMixer.emit('end');
  });
};
