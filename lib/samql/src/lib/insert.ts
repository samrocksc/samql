import { log } from './logger';

/**
 * insert
 * TODO: check input against the items headers
 */
export const insert = async (
  input: Record<string, unknown>[],
  datasource: Record<string, unknown>[]
) => {
  
  log.write('INSERT', input);
  const result = [...datasource, input];
  return result;
};
