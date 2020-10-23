/* eslint-disable max-classes-per-file */
import { prop, getModelForClass } from '@typegoose/typegoose';

class UtilsSchema {
  @prop()
  type: String;

  @prop({ _id: false })
  emojis?: Map<string, {
    id: String,
    guild: String,
  }>;
}

export const Utils = getModelForClass(UtilsSchema);
