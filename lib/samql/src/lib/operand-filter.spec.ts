import { IWhere } from '../retriever-adapter';
import { convertMultipleOperations, operandFilter } from './operand-filter';

describe('operandFilter', () => {
  const testData = [
    { id: 1, name: 'test1', value: 10 },
    { id: 2, name: 'test2', value: 20 },
    { id: 3, name: 'test3', value: 30 },
  ];

  it('should filter with == operator', () => {
    const input: IWhere = ['name', '==', 'test1'];
    const result = operandFilter(input, testData);
    expect(result).toEqual([{ id: 1, name: 'test1', value: 10 }]);
  });

  it('should filter with != operator', () => {
      const input: IWhere = ['name', '!=', 'test1'];
      const result = operandFilter(input, testData);
      expect(result).toEqual([
          { id: 2, name: 'test2', value: 20 },
          { id: 3, name: 'test3', value: 30 }
      ]);
  });

  it('should filter with > operator', () => {
      const input: IWhere = ['value', '>', 20];
      const result = operandFilter(input, testData);
      expect(result).toEqual([{ id: 3, name: 'test3', value: 30 }]);
  });

  it('should filter with < operator', () => {
      const input: IWhere = ['value', '<', 20];
      const result = operandFilter(input, testData);
      expect(result).toEqual([{ id: 1, name: 'test1', value: 10 }]);
  });

      it('should filter with >= operator', () => {
          const input: IWhere = ['value', '>=', 20];
          const result = operandFilter(input, testData);
          expect(result).toEqual([
              { id: 2, name: 'test2', value: 20 },
              { id: 3, name: 'test3', value: 30 }
          ]);
      });

      it('should filter with <= operator', () => {
          const input: IWhere = ['value', '<=', 20];
          const result = operandFilter(input, testData);
          expect(result).toEqual([
              { id: 1, name: 'test1', value: 10 },
              { id: 2, name: 'test2', value: 20 }
          ]);
      });

      it('should throw error for unknown operator', () => {
          const input: IWhere = ['value', '??', 20];
          expect(() => operandFilter(input, testData)).toThrow('Unknown operator: ??');
      });
  });

  describe('convertMultipleOperations', () => {
      const testData = [
          { id: 1, name: 'test1', value: 10 },
          { id: 2, name: 'test2', value: 20 },
          { id: 3, name: 'test3', value: 30 }
      ];

      it('should combine results from multiple filters', () => {
          const filters: IWhere[] = [
              ['value', '>', 20],
              ['value', '<', 20]
          ];
          const result = convertMultipleOperations(filters, testData);
          expect(result).toEqual([
              { id: 3, name: 'test3', value: 30 },
              { id: 1, name: 'test1', value: 10 }
          ]);
      });
});
