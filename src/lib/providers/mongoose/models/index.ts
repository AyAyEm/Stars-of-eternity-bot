import { getModelForClass } from '@typegoose/typegoose';

import { Guilds } from './Guilds';
import { Trackers } from './Trackers';
import { Users } from './Users';
import { Utils } from './Utils';

export * from './Guilds';
export * from './Trackers';
export * from './Users';
export * from './Utils';

export const schemas = {
  Guilds,
  Trackers,
  Users,
  Utils,
};

export const models = {
  Guilds: getModelForClass(Guilds),
  Trackers: getModelForClass(Trackers),
  Users: getModelForClass(Users),
  Utils: getModelForClass(Utils),
};
