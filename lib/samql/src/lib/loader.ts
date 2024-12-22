import * as Papa from 'papaparse';
import { IQueryInput, query } from './query';

export type ILoadOutput = IQueryInput &
  Readonly<{
    query: (input: string) => Promise<{
      rows: number;
      data: unknown[];
    }>;
  }>;

/**
 * Load a file and return its content as a string.  Will throw if invalid CSV data
 */
export const load = (
  file: string,
  options?: {
    tableName: string;
  }
): ILoadOutput => {
  const parseData = Papa.parse(file, {
    dynamicTyping: true,
  });

  const [headers, ...data] = parseData.data;

  const normalizedData: IQueryInput = {
    tableName: options?.tableName ?? 'default',
    headers: headers as string[],
    data: data as unknown[][],
    errors: parseData.errors,
    meta: parseData.meta,
    operations: {},
  };

  return {
    ...normalizedData,
    query: query(normalizedData),
  };
};
