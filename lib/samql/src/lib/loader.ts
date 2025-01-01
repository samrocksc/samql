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
export const load = async (
  file: string,
  options?: {
    tableName: string;
  }
): Promise<ILoadOutput> => {
  const parseData = Papa.parse(file, {
    dynamicTyping: true,
    header: true,
  });

  const normalizedData: IQueryInput = {
    tableName: options?.tableName ?? 'default',
    headers: parseData.meta.fields as string[],
    data: parseData.data as IQueryInput['data'],
    errors: parseData.errors,
    meta: parseData.meta,
    operations: {},
  };

  return {
    ...normalizedData,
    query: query(normalizedData),
  };
};
