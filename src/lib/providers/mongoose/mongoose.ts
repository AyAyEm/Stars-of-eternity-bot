import type { DocumentType } from '@typegoose/typegoose';
import * as mongoose from 'mongoose';

import { config } from '@root/config';
import { generateMongoDocument } from './MongoDocument';
import { Provider, GetAllParams } from '../Provider';
import * as models from './models';

import type { Query as ProviderQuery } from '../Provider';

const mongoConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

export interface Query extends ProviderQuery {
  model: keyof typeof models;
}

type Models = typeof models[keyof typeof models];

export class Mongoose extends Provider {
  public generateDocument = generateMongoDocument;

  public Trackers = generateMongoDocument('Trackers');

  public Guilds = generateMongoDocument('Guilds');

  public Users = generateMongoDocument('Users');

  public Utils = generateMongoDocument('Utils');

  public models = models;

  public connection: Promise<this>;

  constructor(connectionString = config.mongoConnectionString) {
    super();
    this.connection = mongoose
      .connect(connectionString, mongoConnectionOptions)
      .then(() => this);
  }

  public async get<T = Models>(query: Query, path?: string): Promise<DocumentType<T>> {
    const Model: Models = models[query.model as keyof typeof models];
    if (Model) {
      const identify = typeof query.id === 'string' ? { id: query.id } : query.id;
      const queryResult = await (Model as any).findOne(identify) as DocumentType<T>;
      return path ? queryResult.get(path) : queryResult;
    }
    return null;
  }

  public async getAll<T>(model: string, { filter = {}, path }: GetAllParams = {}) {
    const Model: Models = models[model as keyof typeof models];
    if (Model) {
      const documents: DocumentType<T>[] = await (Model as any).find(filter);
      return path ? documents.map((doc) => doc.get(path)) : documents;
    }
    return null;
  }

  public async set<T = any>(query: Query, path: string, value: T) {
    const document = await this.get(query);
    await document.updateOne({ [path]: value });
    return this;
  }
}
