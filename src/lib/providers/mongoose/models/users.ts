/* eslint-disable max-classes-per-file */
import { prop, getModelForClass } from '@typegoose/typegoose';

class UsersSchema {
  @prop()
  public id: string;

  @prop()
  name: string;

  @prop({ _id: false })
  settings: {
    follow: {
      items: string[],
    },
  };
}

export const Users = getModelForClass(UsersSchema);
