import * as dotenv from 'dotenv';

const env = dotenv.config().parsed;
export const config = {
  token: env.DISCORD_TOKEN,
  mongoConnectionString: env.MONGO_CONNECTION_STRING,
};
