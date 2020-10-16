import { Readable } from 'stream';

const silenceFrame = Buffer.from([0xF8, 0xFF, 0xFE]);
export class SilenceStream extends Readable {
  // eslint-disable-next-line no-underscore-dangle
  _read() {
    this.push(silenceFrame);
  }
}
