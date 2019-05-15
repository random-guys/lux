import { Client } from "soap";

/**
 * Describes a soap response from a soap service
 */
export interface MethodResult {
  [key: string]: string
}

/**
 * SOAP method as an async function
 */
export type MethodProxy = (arg: {}) => Promise<string>

/**
 * Create a function that calls a soap method referenced by `path` 
 * @param client `node-soap` client
 * @param path list of namespaces leading to the method and
 * the method e.g. `MyNamespace.SubNamespace.MyMethod` is equivalent to
 * `[MyNamespace, SubNamespace, MyMethod]`
 */
export function asyncMethod(client: Client, ...path: string[]): MethodProxy {
  // get the method
  let method: any = path.reduce((x, k) => x[k], client)
  let mainMethod = path[path.length - 1]

  // return an async wrapper around the function
  return (payload: {}) => {
    return new Promise<string>((resolve, reject) => {
      method(payload, (err: any, x: MethodResult) => {
        if (err) return reject(err)

        let response = x[`${mainMethod}Result`]
        let [code, result] = response.split('|')

        console.log(response, x)
        // response doesn't follow normal format
        if (!code) return reject({ code: 1000, message: response })

        if (code !== '00') return reject({ code, message: result.trim() })
        else return resolve(result.trim())
      })
    })
  }
}
