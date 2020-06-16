const { Command } = require('klasa');

module.exports = class extends Command {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, {
      enabled: true,
      runIn: ['text', 'dm', 'group'],
      requiredPermissions: [],
      requiredSettings: [],
      aliases: [],
      autoAliases: true,
      bucket: 1,
      cooldown: 0,
      promptLimit: 0,
      promptTime: 30000,
      deletable: false,
      guarded: false,
      nsfw: false,
      permissionLevel: 0,
      description: '',
      extendedHelp: 'No extended help available.',
      usage: '[param:string]',
      usageDelim: ' ',
      quotedStringSupport: false,
      subcommands: false,
    });
  }
  // get provider() {

  // }

  // async run(msg, [...params]) {
  //     console.log(this.provider)
  // }

  // async init() {
  //   const provider = await this.client.providers.get('mongoose');
  //   // await this.client.warframe.trackers.teste2;
  //   const data = await provider.trackers.findOne({ tracker: 'invasion', type: 'warframe' });
  //   console.log(data);
  // }
};
