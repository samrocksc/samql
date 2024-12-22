import { ILoadOutput, load } from './lib/loader';
import { query } from './lib/query';
export * from './lib/loader';

export type Operations = (input: typeof load) => Readonly<{
  query: (query: string) => unknown;
}>;


export type SamQL = () => Readonly<{
  document: () => Readonly<{
    load: (csv: string) => Promise<Readonly<{
      data: ILoadOutput;
      query: (query: string) => unknown;
    }>>;
  }>;
}>;

export const samQL: SamQL = () => ({
  document: () => ({
    load: async (csv: string) => {
      const data = await load(csv);
      return {
        data,
        query: async (input) => {
          return query(data)(input);
        },
      };
    },
  }),
});
