/* eslint-disable max-classes-per-file */
import { prop, getModelForClass, ModelOptions } from '@typegoose/typegoose';

@ModelOptions({ options: { customName: 'Utils' } })
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
