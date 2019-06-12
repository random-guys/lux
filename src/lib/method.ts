import { Client } from "soap";
import { promisify } from "util";
import { MethodError } from "./error";
import { MethodMaker, MethodResult } from "./types";
import { compose } from "./utils";

/**
 * Convert a method path to a function
 * @param client SOAP client
 * @param path method path
 */
export const pathToFn =
  (client: Client, ...path: string[]) =>
    path.reduce((x, k) => x[k], client)

/**
 * Get the actual method being called
 * @param path method path
 */
export const leafMethod = (...path: string[]) => path[path.length - 1]


export const asyncMethod: MethodMaker = compose(promisify, pathToFn)

export const parseEmbedded = (path: string[], result?: MethodResult): any => {
  if (!result) return (result: MethodResult) => parseEmbedded(path, result)
  return result[`${leafMethod(...path)}Result`]
}

export function parseFormatted(path: string[], result?: MethodResult): any {
  if (result) {
    let embedded: string = parseEmbedded(path, result)
    let [code, data] = embedded.split('|')

    if (!data) {
      throw new MethodError('1000', result, embedded)
    }

    if (code !== '00')
      throw new MethodError(code, result, data.trim())
    else
      return data.trim()
  }
  return (result: MethodResult) => parseFormatted(path, result)
}