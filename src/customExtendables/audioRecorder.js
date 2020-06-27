const { Readable } = require('stream');
const AudioMixer = require('@rophil/audio-mixer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const _ = require('lodash');
const { config } = require('../config');

ffmpeg.setFfmpegPath(require('ffmpeg-static'));
ffmpeg.setFfprobePath(require('ffprobe-static').path);

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

module.exports = async (voiceConnection, client) => {
  voiceConnection.play(new Silence(), { type: 'opus' });
  const { channel } = voiceConnection;
  const pcmMixer = new AudioMixer({
    channels: 2,
    bitDepth: 16,
    sampleRate: 48000,
    clearInterval: 250,
  });
  const mixerInput = pcmMixer.input({
    channels: 2,
    bitDepth: 16,
    sampleRate: 48000,
  });
  channel.members.each((member) => {
    const voiceStream = voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
    voiceStream.pipe(mixerInput);
  });
  const idPath = `.\\audios\\${_.uniqueId('audio_')}.ogg`;
  const outputStream = fs.createWriteStream(idPath);
  const encoder = ffmpeg(pcmMixer)
    .inputOptions(['-f s16le', '-acodec pcm_s16le', '-ac 2', '-ar 48000'])
    .audioCodec('opus')
    .format('opus')
    .on('error', console.error)
    .pipe(outputStream);
  const fileName = audioName();
  voiceConnection.on('disconnect', async () => {
    pcmMixer.emit('end');
    await encoder;
    await fs.promises.rename(idPath, `.\\audios\\${fileName()}.ogg`);
  });
  client.on(`${voiceConnection.channel.id}memberJoined`, async (member) => {
    if (member.guild.id !== voiceConnection.channel.guild.id) return;
    const voiceStream = voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
    voiceStream.pipe(mixerInput);
  });
};
