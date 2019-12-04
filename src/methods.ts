import { Client } from "soap";
import { promisify } from "util";
import { compose } from "./utils";

/**
 * This is the path to the method, from the namespaces to the
 * actual method name
 */
export type MethodPath = string[];

/**
 * MethodResult is basically a map
 */
export interface MethodResult {
  [key: string]: any;
}

/**
 * MethodError represents failed method calls.
 */
export class MethodError extends Error {
  constructor(
    public readonly code: string,
    public readonly result: MethodResult,
    message: string
  ) {
    super(message);
  }
}

/**
 * AsyncMethod is a method as a function that returns its
 * result in a promise
 */
export type AsyncMethod = (payload: any) => Promise<any>;

const pathToFn = (client: Client, ...path: MethodPath) =>
  path.reduce((x, k) => x[k], client);

const getMethodName = (...path: MethodPath) => path[path.length - 1];

/**
 * createAsyncMethod creates an `AsyncMethod`
 * @param {Client} client `soap` client
 * @param {MethodPath} path method path
 */
export const createAsyncMethod: (
  client: Client,
  ...path: string[]
) => AsyncMethod = compose(promisify, pathToFn);

/**
 * parseEmbedded retrieves the actual result from a standard `soap` service
 * i.e. a service that returns its result wrapped in `${method_name}Result`
 * @param path method path
 * @param result retrieved method result. Don't pass this to return a partial
 * application of `parseEmbedded`
 */
export const parseEmbedded = (path: MethodPath, result?: MethodResult): any => {
  if (!result) return (result: MethodResult) => parseEmbedded(path, result);
  return result[`${getMethodName(...path)}Result`];
};

/**
 * parseFormatted is `parseEmbedded` with response codes. i.e. `$code | $string_result`
 * wrapped in `${method_name}Result`
 * @param path method path
 * @param result retrieved method result. Don't pass this to return a partial
 * application of `parseFormatted`
 */
export function parseFormatted(path: MethodPath, result?: MethodResult): any {
  if (result) {
    let embedded: string = parseEmbedded(path, result);
    let [code, data] = embedded.split("|");

    if (!data) {
      throw new MethodError("1000", result, embedded);
    }

    if (code !== "00") throw new MethodError(code, result, data.trim());
    else return data.trim();
  }
  return (result: MethodResult) => parseFormatted(path, result);
}
