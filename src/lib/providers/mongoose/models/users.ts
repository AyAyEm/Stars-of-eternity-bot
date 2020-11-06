/* eslint-disable max-classes-per-file */
import { prop, ModelOptions } from '@typegoose/typegoose';

class Follow {
  @prop({ type: () => [String] })
  public items: string[];
}

class Settings {
  @prop()
  public follow: Follow;
}

@ModelOptions({ options: { customName: 'Users' } })
export class Users {
  @prop()
  public id: string;

  @prop()
  public name: string;

  @prop({ _id: false })
  public settings: Settings;
}
