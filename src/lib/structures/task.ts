import { Awaited, PieceContext } from '@sapphire/framework';
import { AliasPieceOptions } from '@sapphire/pieces';

import { EternityBasePiece } from './EternityBasePiece';

export interface TaskOptions extends AliasPieceOptions {
  time: number;
}

export abstract class Task extends EternityBasePiece {
  private _interval: NodeJS.Timer | null;

  public time: number;

  public abstract run(...args: readonly unknown[]): Awaited<void>;

  constructor(context: PieceContext, { name, ...options }: TaskOptions) {
    super(context, { name: (name ?? context.name).toLowerCase(), ...options });
    this.time = options.time || 1000;
    this.enabled = options.enabled ?? true;
    if (!this._interval && this.enabled) this._interval = this._create();
  }

  private _create(): NodeJS.Timer {
    this.run();
    return this.client.setInterval(() => {
      this.run();
    }, this.time);
  }

  public onUnload() {
    if (this._interval) {
      this.client.clearInterval(this._interval);
      this._interval = null;
    }
  }
}
