const { Readable } = require('stream');
const { Lame } = require('node-lame');
const fs = require('fs');

const idGenerator = () => `opus_${Math.random().toString(36).substr(2, 9)}`;
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
  const fileId = idGenerator();
  const opusFile = `./audios/${fileId}`;
  audio.pipe(fs.createWriteStream(opusFile));
  voiceConnection.on('disconnect', async () => {
    audio.end();
    const encoder = new Lame({
      output: './audios/teste2.mp3',
      bitrate: 192,
      raw: true,
      signed: true,
      bitwidth: 16,
      sfreq: 48,
      'little-endian': true,
    }).setFile(opusFile);
    await encoder.encode();
    fs.unlink(opusFile, (err) => {
      if (err) throw new Error(err);
    });
  });
};
