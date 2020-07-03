/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
const { Provider, util: { mergeDefault, mergeObjects, isObject } } = require('klasa');
const mongoose = require('mongoose');
const chachegoose = require('cachegoose');

const { Schema } = mongoose;

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
    const memberData = new Schema({
      toFollow: { type: Boolean, default: false },
    });
    const guildsSchema = new Schema({
      id: String,
      name: String,
      members: { type: Map, of: memberData },
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
    const invasionTrackerDoc = { tracker: 'invasion', type: 'warframe' };
    const invasionTrackerExists = await this.models.Trackers.exists(invasionTrackerDoc);
    if (!invasionTrackerExists) this.models.Trackers.create({ ...invasionTrackerDoc, data: {} });
  }

  /* Custom table methods */
  get Guilds() {
    return this.models.Guilds;
  }

  get Trackers() {
    return this.models.Trackers;
  }

  get warframe() {
    return {
      invasion: this.models.Trackers.findOne({ tracker: 'invasion', type: 'warframe' }),
    };
  }

  async guildDocument(guildId) {
    return this.models.Guilds.findOne({ id: guildId });
  }

  async getMessages(msg) {
    const { Guilds } = this;
    const guildDocument = await Guilds.findOne({ id: msg.guild.id });
    const messages = guildDocument.get(`channels.${msg.channel.id}.messages`, Map);
    return { messages, guildDocument, Guilds };
  }

  get exec() {
    return this.db;
  }

  get Guild() {
    return async function Guild(guildID) {
      Guild.id = { id: guildID };
      Guild.model = this.models.Guilds;
      Guild.get = async function get(key, type = null) {
        if (!key) throw new Error('Missing key');
        return this.trackerDocument.get(key, type);
      };
      Guild.set = async function set(key, value) {
        if (!key) throw new Error('Missing key');
        await this.trackerDocument.set(key, value).save();
        return this;
      };
      Guild.reload = async function reload() {
        this.trackerDocument = await this.model.findOne(this.id);
        return this;
      };
      await Guild.reload();
      return Guild;
    };
  }

  get Tracker() {
    return async function Tracker(tracker) {
      Tracker.id = { tracker };
      Tracker.model = this.models.Trackers;
      Tracker.get = async function get(key, type = null) {
        if (!key) throw new Error('Missing key');
        return this.trackerDocument.get(key, type);
      };
      Tracker.set = async function set(key, value) {
        if (!key) throw new Error('Missing key');
        await this.trackerDocument.set(key, value).save();
        return this;
      };
      Tracker.reload = async function reload() {
        this.trackerDocument = await this.model.findOne(this.id);
        return this;
      };
      await Tracker.reload();
      return Tracker;
    };
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
