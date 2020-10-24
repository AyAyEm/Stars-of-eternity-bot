/* eslint-disable max-classes-per-file */
import { prop, getModelForClass, ModelOptions } from '@typegoose/typegoose';

@ModelOptions({ options: { customName: 'Users' } })
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
