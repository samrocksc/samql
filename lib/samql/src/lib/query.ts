import { makeAdapter, processQuery } from '../retriever-adapter';
import { log } from './logger';
import { parse } from './parser';
import { IOperationRecord, sqlSections } from './sql-operations';

export type BaseQuery = string;

export type IQueryInput = Readonly<{
  // Lock this down as tight as possible to maintain index integrity
  tableName: string;
  headers: Readonly<string[]>;
  data: unknown[][];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
  operations: IOperationRecord;
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
    log.query('query', parsedQuery);
    console.time('retrieve');
    const adapter = makeAdapter(sqlSections)(parsedQuery);
    const result = await processQuery(adapter)(parsedQuery);
    log.query('result', result);
    console.timeEnd('retrieve');
    console.time('filter');
    console.timeEnd('filter');
    return {
      rows: 0,
      data: [],
    };
  };
