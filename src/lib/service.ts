import { Client } from "soap";
import { asyncMethod, MethodProxy } from "./method";

export class SoapService {
  private readonly methods = {}
  constructor(private readonly client: Client) { }

  /**
   * Proxy to `Client.describe`
   */
  getDescription(): Promise<{}> {
    return this.client.describe()
  }

  /**
   * Create a function that calls a soap method referenced by `path`
   * @param raw flag to allow method results without error codes
   * @param path list of namespaces leading to the method and 
   * the method e.g. `MyNamespace.SubNamespace.MyMethod` is equivalent to
   * `[MyNamespace, SubNamespace, MyMethod]`
   */
  getMethod(raw: boolean, ...path: string[]): MethodProxy {
    let key = path.join('.')
    // cache method for later use
    if (!this.methods[key]) {
      this.methods[key] = asyncMethod(this.client, raw, ...path)
    }
    return this.methods[key]
  }

  /**
   * Rather than get the method, call the method directly
   * @param raw flag to allow method results without error codes
   * @param arg data to send to soap service
   * @param path list of namespaces to reach the method, same as 
   * `SoapService.getMethod`
   */
  call(raw: boolean, arg: {}, ...path: string[]): Promise<string> {
    let method = this.getMethod(raw, ...path)
    return method(arg)
  }
}