// import { pipeline } from 'stream';
import { sqlSections } from './sql-operations';
import { BaseQuery, IQueryInput } from './query';

export type IParseInput = IQueryInput &
  Readonly<{ query: BaseQuery; parts?: string[] }>;

export type IParseOutput = IParseInput;

/**
 * splits strings and ensures GROUP BY and ORDER BY are split correctly
 */
export const splitStrings = (input: IParseInput): IParseInput => {
  const parts = input.query.split(' ');
  return { ...input, parts };
};

/**
 * groups GROUP BY and ORDER BY into their respective sections and ensures each word is followed by BY */
export const cleanKeywords = (input: IParseInput) => {
  const { parts } = input;

  if (!parts?.length) {
    console.log('input', input);
    return input;
  }

  const cleanedParts = parts?.reduce((acc, part, index) => {
    const prevValue = acc[acc.length - 1];

    if ((prevValue === 'GROUP' || prevValue === 'ORDER') && part !== 'BY') {
      throw new Error('Please ensure your GROUP BY is followed by BY');
    }

    if ((prevValue === 'GROUP' || prevValue === 'ORDER') && part === 'BY') {
      const payload = [[...acc.slice(0, -1)], `${prevValue} ${part}`].flat();

      return payload;
    }

    return [...acc, part];
  }, [] as string[]);

  return { ...input, parts: cleanedParts };
};

export const getParts = (input: IParseInput) => {
  let currentSection = '';
  if (!input.parts) {
    return input;
  }

  const operations = input.parts.reduce((acc, word) => {
    if (Object.keys(sqlSections).includes(word.toUpperCase())) {
      currentSection = word;
      acc[currentSection.toUpperCase()] = [];
      return acc;
    }

    if (currentSection) {
      acc[currentSection].push(word);
    }

    return acc;
  }, {} as Record<string, string[]>);

  console.log('newValues', operations);
  return {
    ...input,
    operations,
  };
};

export const handleAndOr = (input: IParseInput) => {
  console.log(
    'Object.entries(input.operations)',
    Object.entries(input.operations)
  );

  return input;
};

export const getProjections = (input: IParseInput): IParseInput => input;

export const getFilters = (input: IParseInput) => input;

export const checkColumns = (input: IParseInput) => input;

export const getOrders = (input: IParseInput) => input;

export const parse = (input: IParseInput) => {
  return getParts(cleanKeywords(splitStrings(input)));
};
