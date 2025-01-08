import { log } from './lib/logger';
import { convertMultipleOperations, operandFilter } from './lib/operand-filter';
import { IParseOutput } from './lib/parser';
import { IQueryInput } from './lib/query';
import { SqlSection } from './lib/sql-operations';
import { insert } from './lib/insert';

// I want the output to be an object of keys from sqlSections and each value an async function of differing signatures

export type IWhere = Readonly<
  [
    left: string | number,
    compare: '==' | '!=' | '>' | '<' | '>=' | '<=',
    right: string | number
  ]
>;

/**
 * extractKeys is a general function to reduce and extract keys from an object
 */
const extractKeys =
  (keys: Readonly<string[]>) => (obj: Record<Readonly<string>, unknown>) =>
    keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});

/**
 * makeAdapter creates an adapter for the current query
 */
export const makeAdapter =
  (sqlSections: SqlSection) => (parsedData: IParseOutput) => {
    return {
      ...sqlSections,
      SELECT: {
        ...sqlSections.SELECT,
        operation: async (
          input: Readonly<[tableName: string, columns: string[]]>
        ) => {
          log.retrieve('SELECT', input);
          if (parsedData.tableName === 'default') {
            throw Error('SELECT is only usable with a table name');
          }
          throw Error('SELECT is not usable at this time, please use POJECT');
          return [];
        },
      },
      PROJECT: {
        ...sqlSections.PROJECT,
        operation: async (
          input: Readonly<string[]>,
          datasource: Record<string, unknown>[]
        ) => {
          log.retrieve('PROJECT', input);
          const result = datasource.map((datum) => {
            return extractKeys(input)(datum);
          });
          return result;
        },
      },
      FILTER: {
        ...sqlSections.FILTER,
        operation: async (
          input: IWhere,
          datasource: Record<string, unknown>[]
        ) => {
          log.retrieve('WHERE', input);
          const result = operandFilter(input, datasource);
          return result;
        },
      },
      INSERT: {
        ...sqlSections.INSERT,
        operation: insert,
      },
      WHERE: {
        ...sqlSections.WHERE,
        operation: async (
          input: IWhere[],
          datasource: Record<string, unknown>[]
        ) => {
          log.retrieve('WHERE', input);
          const result = convertMultipleOperations(input, datasource);
          return result;
        },
      },
      'SORT BY': {
        ...sqlSections['SORT BY'],
        operation: async (
          input: Readonly<string[]>,
          datasource: Record<string, unknown>[]
        ) => {
          const [column] = input;
          if (!parsedData.headers.includes(column)) {
            throw Error('Cannot group by unknown column');
          }
          if (parsedData.headers.includes(column)) {
            if (typeof parsedData.data[0][column] === 'string') {
              const sortedData = datasource.sort((a, b) => {
                return (a[column] as string).localeCompare(b[column] as string);
              });
              return sortedData;
            }
          }
          return datasource;
        },
      },
    };
  };

/**
 * not really happy with having to use this type, but it is what it is
 */
export type Adapter = ReturnType<ReturnType<typeof makeAdapter>>;

export type AdapterKey = keyof Adapter;

export const orderOfOperations = ['FILTER', 'SORT BY', 'PROJECT'] as const;

export const sortAdapter = (adapter: Adapter): Adapter => {
  const entries = Object.entries(adapter);
  entries.sort(([, a], [, b]) => {
    return a.sequence - b.sequence;
  });
  return Object.fromEntries(entries) as Adapter;
};

/**
 * processQuery is where the actual ordering magic happens
 */
export const processQuery =
  (adapter: Adapter) => async (query: IParseOutput) => {
    const sortedAdapter = sortAdapter(adapter);
    let aggregatedResults = query;

    for (const [adapterOperationName, retriever] of Object.entries(
      sortedAdapter
    )) {
      const operationKey =
        adapterOperationName as keyof typeof queryOperationParameters;
      const queryOperationParameters = query.operations;

      if (queryOperationParameters?.[operationKey]) {
        const params = queryOperationParameters?.[operationKey] as any;
        const result = (await retriever.operation(
          params,
          aggregatedResults.data
        )) as IQueryInput['data'];
        const { [operationKey]: _, ...restOperations } =
          aggregatedResults.operations;
        aggregatedResults = {
          ...aggregatedResults,
          operations: restOperations,
          data: result,
        };
      }
    }

    return {
      rows: aggregatedResults.data.length,
      data: aggregatedResults.data,
    };
  };
