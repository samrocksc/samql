import { ISqlSections, SectionKeys, sectionOperators } from './sql-operations';
import { BaseQuery, IQueryInput } from './query';
import { log } from './logger';

export type IParseInput = IQueryInput &
  Readonly<{ query: BaseQuery; parts?: string[] }>;

export type IParseOutput = IParseInput;

/**
 * splits strings and ensures GROUP BY and ORDER BY are split correctly
 */
export const splitStrings = (input: IParseInput): IParseInput => {
  if (!input.query) {
    return input;
  }
  const parts = input.query.split(' ');
  const cleanParts = parts.map((part) => part.replace(/,/g, ''));
  return { ...input, parts: cleanParts };
};

/**
 * groups GROUP BY and ORDER BY into their respective sections and ensures each word is followed by BY */
export const cleanKeywords = (input: IParseInput) => {
  const { parts } = input;

  if (!parts?.length) {
    return input;
  }

  const cleanedParts = parts?.reduce((acc, part) => {
    const byOperators = ['GROUP', 'ORDER', 'SORT'];
    const prevValue = acc[acc.length - 1];

    if (byOperators.includes(prevValue) && part !== 'BY') {
      throw new Error('Please ensure your GROUP BY is followed by BY');
    }

    if (byOperators.includes(prevValue) && part === 'BY') {
      // remove the last value here and then add in the new value
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
        return acc;
      }

      return acc;
    }, {} as Record<SectionKeys, string[]>);

    return {
      ...input,
      operations: operations as IQueryInput['operations'],
    };
  };

/**
 * Indescriminately breaks apart And and Or statements.
 * We would need to figure out the order of operations for these.
 */
export const handleLogicOperations = (input: IParseInput) => {
  const { operations } = input;
  if (!operations?.WHERE) {
    return input;
  }

  /**
   * split every and statement out and return array of arrays
   **/
  const combinedAndOr = operations.WHERE.reduce(
    (acc, word) => {
      if (word === 'AND' || word === 'OR') {
        acc.push([]);
        return acc;
      }

      acc[acc.length - 1].push(word);
      return acc;
    },
    [[]] as string[][]
  );

  // I did this immutably
  const result = {
    ...input,
    operations: {
      ...input.operations,
      WHERE: combinedAndOr,
    },
  };
  return result;
};

// TODO: implement a function that checks that all columns are valid
export const checkColumns = (input: IParseInput) => input;

export const parse = (input: IParseInput) => {
  const split = splitStrings(input);
  log.parse('split', split);
  const cleaned = cleanKeywords(split);
  log.parse('clean', cleaned);
  const parts = getParts(cleaned)(sectionOperators);
  log.parse('parts', parts);
  const withLogicParts = handleLogicOperations(parts);
  log.parse('withLogicParts', withLogicParts);
  return withLogicParts as IParseOutput;
};
