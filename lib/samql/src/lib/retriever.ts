import { IParseOutput } from './parser';

export type IRetrieverInput = IParseOutput;

export const retrieve = async (input: IRetrieverInput) => input;
