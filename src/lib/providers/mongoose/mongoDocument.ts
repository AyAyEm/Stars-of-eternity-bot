import type { DocumentType } from '@typegoose/typegoose';

import * as models from './models';

import type { Query } from './Mongoose';

export function generateMongoDocument(model: Query['model']) {
  return class MongoDocument {
    public document!: DocumentType<typeof model>;

    public query: Query;

    public load: Promise<MongoDocument>;

    constructor(query: { id: Query['id'] }) {
      this.query = { ...query, model };
      this.load = this.reload();
    }

    public async reload() {
      this.document = await (models[model] as any).findOne(this.query.id);
      return this;
    }

    public get<Result = any>(path: string, defaultType?: any): Result {
      return this.document.get(path, defaultType);
    }

    public async set<Value = any>(path: string, value: Value) {
      this.document.updateOne({ [path]: value }, { upsert: true });
      return this.reload();
    }
  };
}

export type MongoDocument = ReturnType<typeof generateMongoDocument>;
