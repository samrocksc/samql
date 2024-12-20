import { debug } from 'debug';

export const log = {
  info: debug('samql:info'),
  error: debug('samql:error'),
  debug: debug('samql:debug'),
  query: debug('samql:query'),
} as const;

/**
 * side effect friendly passthrough logger
 */
export const pipeLog = (input: unknown, mode: keyof typeof log) => {
  try {
    log[mode](input);
    return input;
  } catch (_error) {
    return input;
  }
};
