import { Awaited, PieceContext } from '@sapphire/framework';
import { AliasPieceOptions } from '@sapphire/pieces';

import { EternityBasePiece } from './EternityBasePiece';

export interface TaskOptions extends AliasPieceOptions {
  time?: number;
  once?: boolean;
}

export abstract class Task extends EternityBasePiece {
  private _interval: NodeJS.Timer | null;

  public time: number;

  public once: boolean;

  public abstract run(...args: readonly unknown[]): Awaited<void>;

  constructor(context: PieceContext, { name, ...options }: TaskOptions) {
    super(context, { name: (name ?? context.name).toLowerCase(), ...options });
    this.time = options.time || 1000;
    this.enabled = options.enabled ?? true;
    this.once = options.once ?? false;
  }

  public async create(): Promise<void> {
    this.run();
    if (!this.once) {
      this._interval = this.client.setInterval(() => {
        this.run();
      }, this.time);
    }
    return null;
  }

  public onUnload() {
    if (this._interval) {
      this.client.clearInterval(this._interval);
      this._interval = null;
    }
  }
}
