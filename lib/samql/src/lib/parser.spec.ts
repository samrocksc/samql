import { cleanKeywords, getParts, IParseInput, splitStrings } from './parser';
import { sectionOperators } from './sql-operations';

describe('parser', function () {
  describe('splitStrings', function () {
    it('should clean commas off of words', function () {
      const result = splitStrings({
        query: 'hi, there',
      } as unknown as IParseInput);
      expect(result.parts).toEqual(['hi', 'there']);
    });
  });
  describe('cleanKeywords', function () {
    it('should return the input if there are no parts', function () {
      const result = cleanKeywords({ parts: [] } as unknown as IParseInput);
      expect(result).toEqual({
        parts: [],
      });
    });

    it('should throw if GROUP is not followed by BY', function () {
      expect(() =>
        cleanKeywords({ parts: ['GROUP', 'up'] } as unknown as IParseInput)
      ).toThrow();
    });

    it('properly group GROUP BY', function () {
      const result = cleanKeywords({
        parts: ['GROUP', 'BY', 'up'],
      } as unknown as IParseInput);
      expect(result).toEqual({
        parts: ['GROUP BY', 'up'],
      });
    });
    it('should throw if ORDER is not followed by BY', function () {
      expect(() =>
        cleanKeywords({ parts: ['ORDER', 'up'] } as unknown as IParseInput)
      ).toThrow();
    });

    it('properly group ORDER BY', function () {
      const result = cleanKeywords({
        parts: ['ORDER', 'BY', 'up'],
      } as unknown as IParseInput);
      expect(result).toEqual({
        parts: ['ORDER BY', 'up'],
      });
    });
  });

  describe('getParts', function () {
    it('should properly parse only section operations', function () {
      const result = getParts({
        parts: [
          'PROJECT',
          'nice',
          'createdAt',
          'FROM',
          'table',
          'WHERE',
          'nice',
          '>',
          '1',
          'AND',
          'createdAt',
          '>',
          '3',
          'ORDER BY',
          'hi',
        ],
      } as unknown as IParseInput)(sectionOperators);
      expect(result.operations).toEqual({
        PROJECT: ['nice', 'createdAt'],
        FROM: ['table'],
        WHERE: ['nice', '>', '1', 'AND', 'createdAt', '>', '3'],
        'ORDER BY': ['hi'],
      });
    });
  });
});
