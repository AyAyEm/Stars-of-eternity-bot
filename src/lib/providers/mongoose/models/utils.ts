/* eslint-disable max-classes-per-file */
import { prop, ModelOptions } from '@typegoose/typegoose';

@ModelOptions({ options: { customName: 'Utils' } })
export class Utils {
  @prop()
  type: String;

  @prop({ _id: false })
  emojis?: Map<string, {
    id: String,
    guild: String,
  }>;
}
