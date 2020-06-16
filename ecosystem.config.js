module.exports = {
  apps: [{
    script: 'src/index.js',
    watch: '.',
    watch: true,
    watch_delay: 10000,
    max_memory_restart: '1G'
  }, {
    script: './src/index.js',
    watch: ['./src/index.js']
  }],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
