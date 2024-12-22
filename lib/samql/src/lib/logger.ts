import { debug } from 'debug';

export const log = {
  info: debug('samql:info'),
  error: debug('samql:error'),
  debug: debug('samql:debug'),
  query: debug('samql:query'),
  parse: debug('samql:parse'),
  retrieve: debug('samql:retrieve'),
} as const;