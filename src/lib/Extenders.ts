import { Structures } from 'discord.js';

import {
  EternityGuild,
  EternityMessage,
  EternityVoiceChannel,
  EternityTextChannel,
} from './extensions';

Structures.extend('Guild', () => EternityGuild);
Structures.extend('Message', () => EternityMessage);
Structures.extend('VoiceChannel', () => EternityVoiceChannel);
Structures.extend('TextChannel', () => EternityTextChannel);
