/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
const { Provider, util: { mergeDefault, mergeObjects, isObject } } = require('klasa');
const mongoose = require('mongoose');
const cachegoose = require('cachegoose');

const { Schema } = mongoose;

cachegoose(mongoose);

const resolveQuery = (query) => (isObject(query) ? query : { id: query });

function flatten(obj, path = '') {
  let output = {};
  obj.forEach((key, value) => {
    if (isObject(value)) output = Object.assign(output, flatten(value, path ? `${path}.${key}` : key));
    else output[path ? `${path}.${key}` : key] = value;
  });
  return output;
}

function parseEngineInput(updated) {
  return Object.assign({}, ...updated.map((entry) => ({ [entry.data[0]]: entry.data[1] })));
}

module.exports = class extends Provider {
  constructor(...args) {
    super(...args, { enabled: true });
    this.db = null;
  }

  async init() {
    const invasions = new Schema({
      enabled: Boolean,
      items: [String],
    });
    const guildsSchema = new Schema({
      id: String,
      name: String,
      channels: {
        type: Map,
        of: {
          invasionItems: invasions,
          messages: {
            type: Map,
            of: {
              msgType: String,
              rolesEmoji: {
                type: Map,
                of: {
                  description: String, roleID: String,
                },
              },
            },
          },
        },
      },
    });
    const trackersSchema = new Schema({
      tracker: String,
      type: String,
      data: mongoose.Mixed,
    });
    const connection = mergeDefault({
      host: 'localhost',
      port: 27017,
      db: 'klasa',
      options: {},
    }, this.client.options.providers.mongodb);

    // If full connection string is provided, use that, otherwise fall back to individual parameters
    const connectionString = this.client.options.providers.mongodb.connectionString || `mongodb://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.db}`;
    const mongoClient = await mongoose.connect(
      connectionString,
      mergeObjects(connection.options, { useNewUrlParser: true, useUnifiedTopology: true }),
    );
    this.db = mongoClient.connection;
    this.models = {
      Guilds: mongoose.model('Guilds', guildsSchema),
      Trackers: mongoose.model('trackers', trackersSchema),
    };
    const [query, update, options] = [{ tracker: 'invasion', type: 'warframe' }, {}, { upsert: true, useFindAndModify: false }];
    await this.models.Trackers.findOneAndUpdate(query, update, options);
  }

  /* Custom table methods */
  get Guilds() {
    return this.models.Guilds;
  }

  get Trackers() {
    return this.models.Trackers;
  }

  get trackers() {
    return {
      invasions: this.models.Trackers.findOne({ tracker: 'invasion' }),
    };
  }

  get warframe() {
    return {
      invasion: this.models.Trackers.findOne({ tracker: 'invasion', type: 'warframe' }),
    };
  }

  async getMessages(msg) {
    const { Guilds } = this;
    const guildDocument = await Guilds.findOne({ id: msg.guild.id });
    const messages = guildDocument.get(`channels.${msg.channel.id}.messages`, Map);
    return { messages, guildDocument, Guilds };
  }

  /* Warframe trackers */
  /* Default table methods */

  get exec() {
    return this.db;
  }

  hasTable(table) {
    return this.db.listCollections()
      .toArray()
      .then((collections) => collections.some((col) => col.name === table));
  }

  createTable(table) {
    return this.db.createCollection(table);
  }

  deleteTable(table) {
    return this.db.dropCollection(table);
  }

  /* Document methods */

  getAll(table, filter = []) {
    if (filter.length) {
      return this.db.collection(table)
        .find({ id: { $in: filter } }, { _id: 0 })
        .toArray();
    }
    return this.db.collection(table).find({}, { _id: 0 }).toArray();
  }

  getKeys(table) {
    return this.db.collection(table).find({}, { id: 1, _id: 0 }).toArray();
  }

  get(table, id) {
    return this.db.collection(table).findOne(resolveQuery(id));
  }

  has(table, id) {
    return this.get(table, id).then(Boolean);
  }

  getRandom(table) {
    return this.db.collection(table).aggregate({ $sample: { size: 1 } });
  }

  create(table, id, doc = {}) {
    return this.db.collection(table)
      .insertOne(mergeObjects(this.parseUpdateInput(doc), resolveQuery(id)));
  }

  delete(table, id) {
    return this.db.collection(table).deleteOne(resolveQuery(id));
  }

  update(table, id, doc) {
    return this.db.collection(table).updateOne(resolveQuery(id), {
      $set: isObject(doc) ? flatten(doc) : parseEngineInput(doc),
    }, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      useFindAndModify: false,
    });
  }

  replace(table, id, doc) {
    return this.db.collection(table).replaceOne(resolveQuery(id), this.parseUpdateInput(doc));
  }
};
