/* eslint-disable max-classes-per-file */
import { prop, ModelOptions } from '@typegoose/typegoose';

class Data {
  @prop({ type: () => [String] })
  public cacheIds: string[];
}

@ModelOptions({ options: { allowMixed: 0, customName: 'Trackers' } })
export class Trackers {
  @prop()
  public tracker: string;

  @prop()
  public type: string;

  @prop({ _id: false })
  public data: Data;
}
