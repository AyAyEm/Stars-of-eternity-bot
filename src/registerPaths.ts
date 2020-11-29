import { addAliases } from 'module-alias';
import path from 'path';

addAliases({
  '@root': __dirname,
  '@lib': path.join(__dirname, 'lib'),
  '@config': path.join(__dirname, 'config'),
  '@utils': path.join(__dirname, 'lib/utils'),
  '@embeds': path.join(__dirname, '/lib/embeds'),
  '@providers': path.join(__dirname, '/lib/providers'),
});
