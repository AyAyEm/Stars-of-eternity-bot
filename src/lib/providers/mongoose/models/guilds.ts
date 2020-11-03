/* eslint-disable max-classes-per-file */
import { prop, ModelOptions } from '@typegoose/typegoose';

export class Member {
  @prop({ default: false })
  public toFollow: boolean;
}

export class Message {
  @prop()
  public msgType: string;

  @prop()
  public rolesEmoji: {
    description: string, roleID: string,
  };
}

export class Channel {
  @prop({ _id: false })
  public relicTracker: {
    enabled: boolean,
    messages: Map<string, string>,
  };

  @prop()
  public invasionItems: {
    enabled: boolean,
    items: string[],
  };

  @prop({ _id: false })
  public messages: Map<string, Message>;
}

@ModelOptions({ options: { customName: 'Guilds' } })
export class Guilds {
  @prop()
  public id: string;

  @prop()
  public name: string;

  @prop({ _id: false })
  public members: Map<string, Member>;

  @prop({ _id: false })
  public channels: Map<string, Channel>;
}
