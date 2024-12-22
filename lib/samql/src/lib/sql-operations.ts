import { log } from './logger';

export const sectionKeys = [
  'AND',
  'FILTER',
  'FROM',
  'GROUP BY',
  'HAVING',
  'LIMIT',
  'ORDER BY',
  'PROJECT',
  'SELECT',
  'WHERE',
] as const;

export type SectionKeys = (typeof sectionKeys)[number];

export const taskCategory = ['LOGICAL', 'OPERATOR'] as const;

export type TaskCategory = (typeof taskCategory)[number];

export type TaskTree = Readonly<{
  categories: TaskCategory[];
  description: string;
  sequence: number;
  required: boolean;
  operation: (input: unknown) => void;
}>;

export type SqlSection = Readonly<{ [K in SectionKeys]: TaskTree }>;

export const sqlSections: SqlSection = {
  AND: {
    categories: ['LOGICAL'],
    description: 'Adds an AND condition',
    sequence: 7,
    required: false,
    operation: (input: unknown) => {
      log.debug('AND', input);
    },
  },
  FILTER: {
    categories: ['OPERATOR'],
    description: 'Filters rows based on conditions',
    sequence: 3,
    required: false,
    operation: (input: unknown) => {
      log.debug('FILTER', input);
    },
  },
  FROM: {
    categories: ['OPERATOR'],
    description: 'What table to select from',
    sequence: 2,
    required: true,
    operation: (input: unknown) => {
      log.debug('FROM', input);
    },
  },
  'GROUP BY': {
    categories: ['OPERATOR'],
    description:
      'Groups rows that have the same values, MUST be followed by BY and column name',
    sequence: 4,
    required: false,
    operation: (input: unknown) => {
      log.debug('GROUP', input);
    },
  },
  HAVING: {
    categories: ['OPERATOR'],
    description: 'Filters groups based on conditions',
    sequence: 5,
    required: false,
    operation: (input: unknown) => {
      log.debug('HAVING', input);
    },
  },
  LIMIT: {
    categories: ['OPERATOR'],
    description: 'Limits number of returned rows',
    sequence: 7,
    required: false,
    operation: (input: unknown) => {
      log.debug('LIMIT', input);
    },
  },
  'ORDER BY': {
    categories: ['OPERATOR'],
    description: 'Sorts the result set, MUST be followed by BY',
    sequence: 6,
    required: false,
    operation: (input: unknown) => {
      log.debug('ORDER', input);
    },
  },
  PROJECT: {
    categories: ['OPERATOR'],
    description: 'Specifies which columns to return',
    required: true,
    sequence: 1,
    operation: (input: unknown) => {
      log.debug('PROJECT', input);
    },
  },
  SELECT: {
    categories: ['OPERATOR'],
    description: 'Specifies which columns to return',
    sequence: 1,
    required: true,
    operation: (input: unknown) => {
      log.debug('SELECT', input);
    },
  },
  WHERE: {
    categories: ['OPERATOR'],
    description: 'Filters rows based on conditions',
    sequence: 3,
    required: false,
    operation: (input: unknown) => {
      log.debug('WHERE', input);
    },
  },
} as const;

export type ISqlSections = typeof sqlSections;

export type ISqlSection = Readonly<keyof typeof sqlSections>;

export type ISqlItem = Record<keyof typeof sqlSections, string[]>;

export type IOperationRecord = Readonly<{ [K in ISqlSection]?: string[] }>;

/**
 * Returns a list of all the sections that are operators.  I put this in a file load
 * scope so that these functions will only ever need to be ran once on startup.
 */
export const sectionOperators = (
  Object.keys(sqlSections) as SectionKeys[]
).reduce((acc, key) => {
  if (sqlSections[key].categories.includes('OPERATOR')) {
    return { ...acc, [key]: sqlSections[key] };
  }
  return acc;
}, {} as Record<string, TaskTree>);

export const logicOperators = (
  Object.keys(sqlSections) as SectionKeys[]
).reduce((acc, key) => {
  if (sqlSections[key].categories.includes('LOGICAL')) {
    return { ...acc, [key]: sqlSections[key] };
  }
  return acc;
}, {} as Record<string, TaskTree>);