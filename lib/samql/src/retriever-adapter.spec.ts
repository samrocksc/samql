import { makeAdapter } from './retriever-adapter';
import { sqlSections } from './lib/sql-operations';

describe('retriever-adapter', () => {
  describe('makeAdapter', () => {
    const parsedData = {
      tableName: 'users',
      headers: ['name', 'age'],
      data: [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
      ],
      operations: {
        SELECT: ['name'],
        WHERE: ['age', '>', 25],
        'SORT BY': ['age'],
      },
    };

    it('should create an adapter with SELECT operation', async () => {
      const adapter = makeAdapter(sqlSections)(parsedData as any);
      await expect(
        adapter.SELECT.operation(['users', ['name']])
      ).rejects.toThrow('SELECT is not usable at this time, please use POJECT');
    });

    it('should create an adapter with PROJECT operation', async () => {
      const adapter = makeAdapter(sqlSections)(parsedData as any);
      const result = await adapter.PROJECT.operation(['name'], parsedData.data);
      expect(result).toEqual([{ name: 'Alice' }, { name: 'Bob' }]);
    });

    it('should create an adapter with FILTER operation', async () => {
      const adapter = makeAdapter(sqlSections)(parsedData as any);
      const result = await adapter.FILTER.operation(
        ['age', '>', 25],
        parsedData.data
      );
      expect(result).toEqual([{ name: 'Bob', age: 30 }]);
    });

    it('should create an adapter with SORT BY operation', async () => {
      const adapter = makeAdapter(sqlSections)(parsedData as any);
      const result = await adapter['SORT BY'].operation(
        ['age'],
        parsedData.data
      );
      expect(result).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
      ]);
    });
  });
});
