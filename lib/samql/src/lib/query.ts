import { log } from './logger';
import { parse } from './parser';

export type BaseQuery = string;

export type IQueryInput = Readonly<{
  headers: string[];
  data: unknown[][];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
  operations: unknown[];
}>;

export type Query = Readonly<{
  SELECT?: string[];
  PROJECT?: string[];
  FROM?: string[];
  WHERE?: string[];
  ORDER?: [string, string];
}>;

export type IQueryOutput = Readonly<{
  rows: number;
  data: unknown[];
}>;

export const query =
  (dataset: IQueryInput) =>
  async (query: string): Promise<IQueryOutput> => {
    console.time('query');
    const parsedQuery = parse({
      ...dataset,
      query,
    });
    console.timeEnd('query');
    console.log('parts', parsedQuery);
    return {
      rows: 0,
      data: [],
    };
  };
