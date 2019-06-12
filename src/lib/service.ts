import { Client } from "soap";
import { asyncMethod, parseFormatted, parseEmbedded } from "./method";
import { AsyncMethod, MethodResult } from "./types";

export class SoapService {
  private readonly methods = {}
  constructor(private readonly client: Client) { }

  /**
   * Proxy to `Client.describe`
   */
  getDescription(): Promise<any> {
    return this.client.describe()
  }

  call(arg: {}, ...path: string[]): Promise<MethodResult> {
    let method = this.getMethod(...path)
    return method(arg)
  }

  callEmbedded(arg: {}, ...path: string[]): Promise<string> {
    let method = this.getMethod(...path)
    return method(arg).then(parseEmbedded(path))
  }

  callFormatted(arg: {}, ...path: string[]): Promise<string> {
    let method = this.getMethod(...path)
    return method(arg).then(parseFormatted(path))
  }

  protected getMethod(...path: string[]): AsyncMethod {
    let key = path.join('.')
    // cache method for later use
    if (!this.methods[key]) {
      this.methods[key] = asyncMethod(this.client, ...path)
    }
    return this.methods[key]
  }
}