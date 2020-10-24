/* eslint-disable max-classes-per-file */
import { prop, getModelForClass, ModelOptions } from '@typegoose/typegoose';

class Member {
  @prop({ default: false })
  public toFollow: boolean;
}

class Message {
  @prop()
  public msgType: string;

  @prop()
  public rolesEmoji: {
    description: string, roleID: string,
  };
}

class Channel {
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
class GuildsSchema {
  @prop()
  public id: string;

  @prop()
  public name: string;

  @prop({ _id: false })
  public members: Map<string, Member>;

  @prop({ _id: false })
  public channels: Map<string, Channel>;
}

export const Guilds = getModelForClass(GuildsSchema);
