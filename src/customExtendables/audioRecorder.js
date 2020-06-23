const { Readable } = require('stream');
const { Lame } = require('node-lame');
// eslint-disable-next-line no-unused-vars
const ffmpeg = require('ffmpeg-static');
const { config } = require('../config');

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

module.exports = async (voiceConnection, member) => {
  voiceConnection.play(new Silence(), { type: 'opus' });
  const audio = voiceConnection.receiver.createStream(member.user, { mode: 'pcm', end: 'manual' });
  const chunks = [];
  audio.on('data', (chunk) => {
    chunks.push(chunk);
  });
  const fileName = audioName();
  voiceConnection.on('disconnect', async () => {
    audio.end();
    const buffer = Buffer.concat(chunks);
    const encoder = new Lame({
      output: `./audios/${fileName()}.mp3`,
      bitrate: 64,
      raw: true,
      signed: true,
      bitwidth: 16,
      sfreq: 48,
      'little-endian': true,
    }).setBuffer(buffer);
    await encoder.encode();
  });
};
