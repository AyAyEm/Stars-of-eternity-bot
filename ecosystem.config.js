module.exports = {
  apps: [{
    name: 'stars-of-eternity-bot',
    script: './src/index.js',
    watch: ['./src'],
    ignore_watch: ['node_modules'],
    watch_delay: 1000,
    max_memory_restart: '512M',
  }],
  env: {
    NODE_ENV: 'development',
  },
  env_production: {
    NODE_ENV: 'production',
  },
};
