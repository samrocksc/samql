export const operatorsDictionary = {
  '>': {
    description: 'Returns true if first value is greater than second value',
    example: 'age > 21',
  },
  '<': {
    description: 'Returns true if first value is less than second value',
    example: 'price < 100',
  },
  '=': {
    description: 'Returns true if both values are equal',
    example: 'status = "active"',
  },
  '!=': {
    description: 'Returns true if both values are not equal',
    example: 'category != "archived"',
  },
} as const;

export type IOperators = keyof typeof operatorsDictionary;