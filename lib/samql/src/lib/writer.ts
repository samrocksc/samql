import * as Papa from 'papaparse';
import { IQueryInput } from './query';
import {writeFileSync} from 'fs';
import { log } from './logger';

export type IWriteInput = IQueryInput

/**
 * when we write we wnat to add a piece of JSON to the 
 */
export const writeToDisk = (input: IWriteInput) => {
    const newData = Papa.unparse(input.data);
    writeFileSync(input.fileName, newData)
    log.write('synced');
    return true;
}

