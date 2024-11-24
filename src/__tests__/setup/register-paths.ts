// src/__tests__/setup/register-paths.ts
import moduleAlias from 'module-alias';
import path from 'path';

moduleAlias.addAliases({
  '@app': path.join(__dirname, '../../'),
  '@modules': path.join(__dirname, '../../modules'),
  '@config': path.join(__dirname, '../../config'),
  '@common': path.join(__dirname, '../../common')
});
