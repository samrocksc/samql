export const sectionKeys = [
  'AND',
  'FILTER',
  'FROM',
  'GROUP BY',
  'INSERT',
  'LIMIT',
  'ORDER BY',
  'PROJECT',
  'SELECT',
  'SORT BY',
  'WHERE',
] as const;

export type SectionKeys = (typeof sectionKeys)[number];

export const taskCategory = [
  'LOGICAL',
  'OPERATOR',
  'COMMAND',
  'SINGLE_VALUE',
  'BY',
] as const;

export type TaskCategory = (typeof taskCategory)[number];

export type TaskTree = Readonly<{
  categories: TaskCategory[];
  description: string;
  operation: (input: unknown) => unknown;
  required: boolean;
  sequence: number;
}>;

export type SqlSection = Readonly<{ [K in SectionKeys]: TaskTree }>;

/**
 * This is the list of all the SQL sections and their descriptions.  I utilize this as
 * an AST
 */
export const sqlSections: SqlSection = {
  AND: {
    categories: ['LOGICAL'],
    description: 'Adds an AND condition',
    operation: (input: unknown) => Error('not implemented yet'),
    required: false,
    sequence: 7,
  },
  FILTER: {
    categories: ['OPERATOR'],
    description: 'Filters rows based on conditions',
    operation: (input: unknown) => Error('not implemented yet'),
    required: false,
    sequence: 3,
  },
  FROM: {
    categories: ['OPERATOR'],
    description: 'What table to select from',
    operation: () => Error('not implemented yet'),
    required: true,
    sequence: 2,
  },
  'GROUP BY': {
    categories: ['OPERATOR', 'BY'],
    description:
      'Groups rows that have the same values, MUST be followed by BY and column name',
    operation: () => Error('not implemented yet'),
    required: false,
    sequence: 4,
  },
  INSERT: {
    categories: ['COMMAND'],
    description: 'Filters groups based on conditions',
    operation: () => Error('not implemented yet'),
    sequence: 5,
    required: false,
  },
  LIMIT: {
    categories: ['OPERATOR', 'SINGLE_VALUE'],
    description: 'Limits number of returned rows',
    operation: () => Error('not implemented yet'),
    required: false,
    sequence: 7,
  },
  'ORDER BY': {
    categories: ['OPERATOR', 'SINGLE_VALUE', 'BY'],
    description: 'chooses ordering',
    operation: () => Error('not implemented yet'),
    required: false,
    sequence: 7,
  },
  PROJECT: {
    categories: ['OPERATOR'],
    description: 'Specifies which columns to return',
    operation: () => Error('not implemented yet'),
    required: true,
    sequence: 1,
  },
  SELECT: {
    categories: ['OPERATOR'],
    description: 'Specifies which columns to return',
    operation: () => Error('Not implemented yet'),
    required: true,
    sequence: 1,
  },
  'SORT BY': {
    categories: ['OPERATOR', 'SINGLE_VALUE', 'BY'],
    description: 'chooses ordering',
    operation: () => Error('not implemented yet'),
    required: false,
    sequence: 7,
  },
  WHERE: {
    categories: ['OPERATOR'],
    description: 'Filters rows based on conditions',
    operation: () => Error('Not implemented yet'),
    required: false,
    sequence: 3,
  },
} as const;

export type ISqlSections = typeof sqlSections;

export type ISqlSection = Readonly<keyof typeof sqlSections>;

export type ISqlItem = Record<keyof typeof sqlSections, string[]>;

export type IOperationRecord = Readonly<{ [K in ISqlSection]?: string[] }>;

/**
 * The goal below is to create a dynamic list of categories on startup
 */
const makeCategoryList = (key: TaskCategory) =>
  (Object.keys(sqlSections) as SectionKeys[]).reduce((acc, section) => {
    if (sqlSections[section].categories.includes(key)) {
      return { ...acc, [section]: sqlSections[section] };
    }
    return acc;
  }, {} as Record<string, TaskTree>);

export const logicOperators = makeCategoryList('LOGICAL');
export const sectionOperators = makeCategoryList('OPERATOR');