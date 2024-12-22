import { makeAdapter, processQuery } from '../retriever-adapter';
import { log } from './logger';
import { parse } from './parser';
import { IOperationRecord, sqlSections } from './sql-operations';
import { ParseError, ParseMeta } from 'papaparse';

export type BaseQuery = string;

export type IQueryInput = Readonly<{
  // Lock this down as tight as possible to maintain index integrity
  tableName: string;
  headers: Readonly<string[]>;
  data: Record<string, unknown>[];
  errors: ParseError[];
  meta: ParseMeta;
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
    console.time('retrieve=>filter');
    const adapter = makeAdapter(sqlSections)(parsedQuery);
    const result = await processQuery(adapter)(parsedQuery);
    log.query('result', result);
    console.timeEnd('retrieve=>filter');
    return result;
  };
