import type { DocumentType } from '@typegoose/typegoose';

import { models } from './Models';

import type { Query } from './Mongoose';

export function generateMongoDocument(model: Query['model']) {
  return class MongoDocument {
    public document!: DocumentType<typeof model>;

    public query: Query;

    public load: Promise<MongoDocument>;

    constructor(query: { id: Query['id'] } | string) {
      if (typeof query === 'object') {
        this.query = { ...query, model };
      } else if (typeof query === 'string') {
        this.query = { id: query, model };
      }
      this.load = this.reload();
    }

    public async reload() {
      this.document = await (models[model] as any).findOne(this.query.id);
      return this;
    }

    public async get<Result = any>(path: string, defaultType?: any): Promise<Result> {
      await this.load;
      return this.document.get(path, defaultType);
    }

    public async set<Value = any>(path: string, value: Value) {
      await this.load;
      await this.document.updateOne({ [path]: value }, { upsert: true });
      return this.reload();
    }
  };
}

export type MongoDocument = ReturnType<typeof generateMongoDocument>;
