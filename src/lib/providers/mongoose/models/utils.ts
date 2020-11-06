/* eslint-disable max-classes-per-file */
import { prop, ModelOptions } from '@typegoose/typegoose';

export class Emoji {
  @prop()
  id: String;

  @prop()
  guild: String;
}

@ModelOptions({ options: { customName: 'Utils' } })
export class Utils {
  @prop()
  type: String;

  @prop({ _id: false })
  emojis?: Map<string, Emoji>;
}
