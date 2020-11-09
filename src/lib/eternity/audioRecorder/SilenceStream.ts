import { Readable } from 'stream';

const silenceFrame = Buffer.from([0xF8, 0xFF, 0xFE]);
export class SilenceStream extends Readable {
  _read() {
    this.push(silenceFrame);
  }
}
