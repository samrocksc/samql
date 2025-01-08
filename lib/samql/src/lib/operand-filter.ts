import { IWhere } from '../retriever-adapter';

/**
 * Generates a new dataset based on the input
 */
export const operandFilter = (
  input: IWhere,
  datasource: Record<string, unknown>[]
) =>
  datasource.filter((datum) => {
    const [left, operator, right] = input;
    const leftVal = datum[left];
    switch (operator) {
      case '==': {
        return leftVal === right;
      }
      case '!=': {
        return leftVal !== right;
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

export const convertMultipleOperations = (
  filters: IWhere[],
  dataSource: Record<string, unknown>[]
) => {
  const data = filters.reduce<Record<string, unknown>[]>((acc, filter) => {
    const newData = operandFilter(filter, dataSource);
    return [...acc, ...newData];
  }, []);
  return data.flat();
};
