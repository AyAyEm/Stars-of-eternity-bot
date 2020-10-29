/* eslint-disable max-classes-per-file */
import { prop, getModelForClass, ModelOptions } from '@typegoose/typegoose';

class Follow {
  @prop()
  public items: string[];
}

class Settings {
  @prop()
  public follow: Follow;
}

@ModelOptions({ options: { customName: 'Users' } })
class UsersSchema {
  @prop()
  public id: string;

  @prop()
  public name: string;

  @prop({ _id: false })
  public settings: Settings;
}

export const Users = getModelForClass(UsersSchema);
