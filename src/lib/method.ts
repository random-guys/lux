import { Client } from "soap";
import { MethodResult, MethodError, MethodProxy } from "./utils";

/**
 * Create a function that calls a soap method referenced by `path` 
 * @param client `node-soap` client
 * @param raw flag to allow method results without error codes
 * @param path list of namespaces leading to the method and
 * the method e.g. `MyNamespace.SubNamespace.MyMethod` is equivalent to
 * `[MyNamespace, SubNamespace, MyMethod]`
 */
export function asyncMethod(client: Client, raw: boolean, ...path: string[]): MethodProxy {
  // get the method
  let method: any = path.reduce((x, k) => x[k], client)
  let mainMethod = path[path.length - 1]

  // return an async wrapper around the function
  return (payload: {}) => {
    return new Promise((resolve, reject) => {
      method(payload, (err: any, x: MethodResult) => {
        if (err) return reject(err)

        let response = x[`${mainMethod}Result`]
        let [code, result] = response.split('|')

        // only ignore codes when raw flag is on
        if (!result) {
          return raw ? resolve(response) : reject(new MethodError('1000', x, response))
        }

        if (code !== '00')
          return reject(new MethodError(code, x, result.trim()))
        else
          return resolve(result.trim())
      })
    })
  }
}