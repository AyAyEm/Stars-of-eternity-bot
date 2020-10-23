/* eslint-disable max-classes-per-file */
import { prop, getModelForClass, ModelOptions } from '@typegoose/typegoose';
import * as mongoose from 'mongoose';

type Data = {
  cacheIDs: string[],
};

@ModelOptions({ options: { allowMixed: 0 } })
class TrackersSchema {
  @prop()
  tracker: string;

  @prop()
  type: string;

  @prop({ type: mongoose.Schema.Types.Mixed })
  data: Data;
}

export const Trackers = getModelForClass(TrackersSchema);
