import * as i18next from 'i18next/dist/cjs/i18next';

import type { ClientOptions } from 'discord.js';

import { list } from './LanguageFunctions';
import { EternityFormatters } from './Enums';

export const enum Time {
  Millisecond = 1,
  Second = 1000,
  Minute = 1000 * 60,
  Hour = 1000 * 60 * 60,
  Day = 1000 * 60 * 60 * 24,
  Year = 1000 * 60 * 60 * 24 * 365,
}

export namespace Warframe {
  export const factionsStyle = new Map([
    ['Grineer', { tumb: 'https://i.imgur.com/Yh9Ncdv.png', color: '#6c0607' }],
    ['Corpus', { tumb: 'https://i.imgur.com/Aa4BfIH.png', color: '#0000de' }],
    ['Infested', { tumb: 'https://i.imgur.com/n9THxDE.png', color: '#1a931e' }],
  ]);
}

export const clientOptions: ClientOptions = {
  i18n: {
    i18next: {
      fallbackNS: 'default',
      interpolation: {
        format: (value: unknown, format?: string, lang?: string) => {
          switch (format as EternityFormatters) {
            case EternityFormatters.AndList: {
              return list(value as string[], i18next.t('global:and', { lng: lang }));
            }
            case EternityFormatters.OrList: {
              return list(value as string[], i18next.t('global:or', { lng: lang }));
            }
            default:
              return value as string;
          }
        },
      },
    },
  },
};
