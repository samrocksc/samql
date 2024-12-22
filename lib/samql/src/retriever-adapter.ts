import { log } from './lib/logger';
import { IParseOutput } from './lib/parser';
import { SqlSection } from './lib/sql-operations';

// I want the output to be an object of keys from sqlSections and each value an async function of differing signatures

export type IWhere = Readonly<
  [
    left: string | number,
    compare: '==' | '!=' | '>' | '<' | '>=' | '<=',
    right: string | number
  ]
>;

export const makeAdapter =
  (sqlSections: SqlSection) => (data: IParseOutput) => {
    return {
      ...sqlSections,
      SELECT: {
        ...sqlSections.SELECT,
        operation: async (
          input: Readonly<[tableName: string, columns: string[]]>
        ) => {
          log.retrieve('SELECT', input);
          if (data.tableName === 'default') {
            throw Error('SELECT is only usable with a table name');
          }
          throw Error('SELECT is not usable at this time, please use POJECT');
          return [];
        },
      },
      PROJECT: {
        ...sqlSections.PROJECT,
        operation: async (input: Readonly<string[]>) => {
          log.retrieve('PROJECT', input);
          // TODO: Implement PROJECT
          return [];
        },
      },
      WHERE: {
        ...sqlSections.WHERE,
        operation: async (input: IWhere) => {
          log.retrieve('WHERE', input);
          // TODO: Implement WHERE
          return data;
        },
      },
      'GROUP BY': {
        ...sqlSections['GROUP BY'],
        operation: async (input: Readonly<string>) => {
          log.retrieve('GROUP BY', input);
          if (data.headers.includes(input)) {
            // TODO: Implement GROUP BY
            return data;
          }
          if (!data.headers.includes(input)) {
            throw Error('Cannot Group By Unknown Column');
          }
          return data;
        },
      },
    };
  };

/**
 * not really happy with having to use this type, but it is what it is
 */
export type Adapter = ReturnType<ReturnType<typeof makeAdapter>>;

export type AdapterKey = keyof Adapter;

export const orderedAdapter = (adapter: Adapter) => {
  const ordered = Object.keys(adapter).sort(
    (a, b) =>
      adapter[a as keyof Adapter].sequence -
      adapter[b as keyof Adapter].sequence
  );
  return ordered;
};

/**
 * TIL: Reduce can be used with async functions
 */
export const processQuery =
  (adapter: Adapter) => async (query: IParseOutput) => {
    const data = Object.entries(adapter).reduce(
      async (acc, [adapterOperationName, retriever]) => {
        // TODO: Marry the parsed data in here as a param
        const castedThing =
          adapterOperationName as keyof typeof queryOperationParameters;
        const queryOperationParameters = query.operations;
        if (
          queryOperationParameters?.[
            adapterOperationName as keyof typeof queryOperationParameters
          ]
        ) {
            const data = await retriever.operation(
              queryOperationParameters?.[castedThing] as any
            );
            typeof data;
          return acc;
        }
        // console.log('curr', value);
        return acc;
      },
      {}
    );
    log.query('processQuery', data);

    return {
      rows: 0,
      data: [],
    };
  };
