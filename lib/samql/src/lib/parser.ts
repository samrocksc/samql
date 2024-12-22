// import { pipeline } from 'stream';
import {
  ISqlSections,
  logicOperators,
  SectionKeys,
} from './sql-operations';
import { BaseQuery, IQueryInput } from './query';
import { log } from './logger';

export type IParseInput = IQueryInput &
  Readonly<{ query: BaseQuery; parts?: string[] }>;

export type IParseOutput = IParseInput;

/**
 * splits strings and ensures GROUP BY and ORDER BY are split correctly
 */
export const splitStrings = (input: IParseInput): IParseInput => {
  const parts = input.query.split(' ');
  log.parse('splitStrings', parts);
  return { ...input, parts };
};

/**
 * groups GROUP BY and ORDER BY into their respective sections and ensures each word is followed by BY */
export const cleanKeywords = (input: IParseInput) => {
  const { parts } = input;

  if (!parts?.length) {
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

export const getParts =
  (input: IParseInput) =>
  (section: Partial<ISqlSections>): IParseInput => {
    let currentSection = '';
    if (!input.parts) {
      return input;
    }

    /**
     * this was a bit of a hard section to filter, hence the mutability and ugly casing. I learned a lot ab out
     * how typescript infers its types, and the limitations of the concept here
     */
    const operations = input.parts.reduce((acc, word) => {
      const wordUp = word.toUpperCase();
      if (Object.keys(section).includes(wordUp)) {
        currentSection = wordUp;
        acc[currentSection as SectionKeys] = [];
        return acc;
      }

      if (currentSection) {
        acc[currentSection as SectionKeys].push(word);
      }

      return acc;
    }, {} as Record<SectionKeys, string[]>);

    log.parse('getParts', operations);
    return {
      ...input,
      operations: operations as IQueryInput['operations'],
    };
  };

export const handleLogicOperations = (input: IParseInput) => {
  return input;
};

export const getProjections = (input: IParseInput): IParseInput => input;

export const getFilters = (input: IParseInput) => input;

export const checkColumns = (input: IParseInput) => input;

export const getOrders = (input: IParseInput) => input;

export const parse = (input: IParseInput) => {
  const split = splitStrings(input);
  const cleaned = cleanKeywords(split);
  const parts = getParts(cleaned)(logicOperators);
  const handledAndOr = handleLogicOperations(parts);
  return handledAndOr;
};
