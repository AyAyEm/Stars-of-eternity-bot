import '@scp/in17n/register';

import i18next from 'i18next';

import type { ClientOptions } from 'discord.js';

import { list } from './LanguageFunctions';
import { EternityFormatters } from './Enums';

export const clientOptions: ClientOptions = {
  i18n: {
    defaultName: 'pt-BR',
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
