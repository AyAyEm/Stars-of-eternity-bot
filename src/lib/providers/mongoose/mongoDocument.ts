import type { DocumentType } from '@typegoose/typegoose';

import { models } from './Models';

import type { Query } from './Mongoose';
import type { ModelsKeys } from './models';

export function generateMongoDocument(modelKey: ModelsKeys) {
  const model = models[modelKey];

  return class MongoDocument {
    public document!: DocumentType<typeof model>;

    public query: Query;

    public load: Promise<MongoDocument>;

    constructor(query: { id: Query['id'] } | string) {
      if (typeof query === 'object') {
        this.query = { id: typeof query.id === 'string' ? { id: query.id } : query.id, model: modelKey };
      } else if (typeof query === 'string') {
        this.query = { id: { id: query }, model: modelKey };
      }

      this.load = this.reload();
    }

    public async reload() {
      const { id } = this.query;
      this.document = await (model as any).findOne(id);
      return this;
    }

    public async get<Result = unknown>(path: string, defaultType?: unknown): Promise<Result> {
      if (!this.document) await this.load;
      return this.document.get(path, defaultType);
    }

    public async set<Value = unknown>(path: string, value: Value) {
      if (!this.document) await this.load;
      await this.document.updateOne({ [path]: value }, { upsert: true });
      return this.reload();
    }
  };
}

export type MongoDocument = ReturnType<typeof generateMongoDocument>;
