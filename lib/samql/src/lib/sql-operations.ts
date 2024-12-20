import { log } from './logger';

export const sqlSections = {
  SELECT: {
    description: 'Specifies which columns to return',
    sequence: 1,
    required: true,
    operation: (input: unknown) => {
      log.debug('SELECT', input);
    },
  },
  PROJECT: {
    description: 'Specifies which columns to return',
    sequence: 1,
    required: true,
    operation: (input: unknown) => {
      log.debug('PROJECT', input);
    },
  },
  FROM: {
    description: 'What table to select from',
    sequence: 2,
    required: true,
    operation: (input: unknown) => {
      log.debug('FROM', input);
    },
  },
  WHERE: {
    description: 'Filters rows based on conditions',
    sequence: 3,
    required: false,
    operation: (input: unknown) => {
      log.debug('WHERE', input);
    },
  },
  FILTER: {
    description: 'Filters rows based on conditions',
    sequence: 3,
    required: false,
    operation: (input: unknown) => {
      log.debug('FILTER', input);
    },
  },
  'GROUP BY': {
    description:
      'Groups rows that have the same values, MUST be followed by BY and column name',
    sequence: 4,
    required: false,
    operation: (input: unknown) => {
      log.debug('GROUP', input);
    },
  },
  HAVING: {
    description: 'Filters groups based on conditions',
    sequence: 5,
    required: false,
    parser: [],
    operation: (input: unknown) => {
      log.debug('HAVING', input);
    },
  },
  'ORDER BY': {
    description: 'Sorts the result set, MUST be followed by BY',
    sequence: 6,
    required: false,
    operation: (input: unknown) => {
      log.debug('ORDER', input);
    },
  },
  LIMIT: {
    description: 'Limits number of returned rows',
    sequencer: 7,
    required: false,
    operation: (input: unknown) => {
      log.debug('LIMIT', input);
    },
  },
} as const;

export type ISqlSection = keyof typeof sqlSections;

export type ISqlItem = Record<keyof typeof sqlSections, string[]>;
