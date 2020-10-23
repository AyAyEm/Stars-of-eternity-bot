import { CommandOptions, Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';
import { Message } from 'discord.js';

// import { Command as EternityCommand } from '@lib/command';

// import type { Query } from '@lib/providers/mongoose';

@ApplyOptions<CommandOptions>({
  preconditions: ['GuildOnly'],
})
export default class extends Command {
  public async run(msg: Message) {
    // const query: Query = { id: '673959947767119895', model: 'Guilds' };
    // const Document = await this.client.provider.get(query);
    // console.log(Document);
    msg.channel.send('teste');
  }
}
