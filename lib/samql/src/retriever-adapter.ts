import { log } from './lib/logger';
import { IParseOutput } from './lib/parser';
import { IQueryInput } from './lib/query';
import { SqlSection } from './lib/sql-operations';

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

const operandFilter = (input: IWhere, datasource: Record<string, unknown>[]) =>
  datasource.filter((datum) => {
    const [left, operator, right] = input;
    const leftVal = datum[left];
    switch (operator) {
      case '==': {
        return left === right;
      }
      case '!=': {
        return left !== right;
      }
      case '>': {
        if (typeof leftVal === 'number') {
          return leftVal > Number(right);
        }
        return false;
      }
      case '<': {
        if (typeof leftVal === 'number') {
          return leftVal < Number(right);
        }
        return false;
      }
      case '>=': {
        if (typeof leftVal === 'number') {
          return leftVal >= Number(right);
        }
        return false;
      }
      case '<=': {
        if (typeof leftVal === 'number') {
          return leftVal <= Number(right);
        }
        return false;
      }
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  });

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
        ...sqlSections.WHERE,
        operation: async (
          input: IWhere,
          datasource: Record<string, unknown>[]
        ) => {
          log.retrieve('WHERE', input);
          const result = operandFilter(input, datasource);
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
    const aggregatedResults = await Object.entries(sortedAdapter).reduce(
      // TIL: You can use async functions in reduce
      async (promise, [adapterOperationName, retriever]) => {
        // kind of janky, but it works, apologies
        const acc = await promise;
        const operationKey =
          adapterOperationName as keyof typeof queryOperationParameters;
        const queryOperationParameters = query.operations;

        if (
          queryOperationParameters?.[
            adapterOperationName as keyof typeof queryOperationParameters
          ]
        ) {
          const params = queryOperationParameters?.[operationKey] as any;
          const result = (await retriever.operation(
            params,
            acc.data
          )) as IQueryInput['data'];
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [operationKey]: _, ...restOperations } = acc.operations;
          const data = {
            ...acc,
            operations: restOperations,
            data: result,
          };
          return data;
        }
        return acc;
      },
      Promise.resolve(query)
    );

    return {
      rows: aggregatedResults.data.length,
      data: aggregatedResults.data,
    };
  };
