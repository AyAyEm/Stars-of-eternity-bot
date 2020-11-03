/* eslint-disable max-classes-per-file */
import { prop, ModelOptions } from '@typegoose/typegoose';
import * as mongoose from 'mongoose';

type Data = {
  cacheIDs: string[],
};

@ModelOptions({ options: { allowMixed: 0, customName: 'Trackers' } })
export class Trackers {
  @prop()
  tracker: string;

  @prop()
  type: string;

  @prop({ type: mongoose.Schema.Types.Mixed })
  data: Data;
}
