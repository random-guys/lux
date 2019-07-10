import { Client } from "soap";
import { asyncMethod, parseFormatted, parseEmbedded } from "./method";
import { AsyncMethod, MethodResult } from "./types";
import { unsafeClient } from "./unsafe";



export class SoapService {
  protected readonly methods = {}
  protected client: Client

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

export class UnsafeSyncService extends SoapService {

  constructor(url: string) {
    super()
    unsafeClient(url).then((cl) => {
      this.client = cl
    })
  }

  private assertClient() {
    if (!this.client) {
      throw new Error('Client not connected')
    }
  }
}

export class AsyncService extends SoapService {
  constructor(client: Client) {
    super()
    this.client = client
  }
}