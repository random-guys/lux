import { Client } from "soap";
import { asyncMethod, parseFormatted, parseEmbedded } from "./method";
import { AsyncMethod, MethodResult } from "./types";
import { unsafeClient, unsafeRun } from "./unsafe";



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
  private queue: Promise<void>
  constructor(url: string) {
    super()

    // connect without security
    this.queue = unsafeRun(async () => {
      return await unsafeClient(url).then((cl) => {
        this.client = cl
      })
    })
  }

  private async assertClient() {
    // wait for connection function
    await this.queue

    // make sure client actually
    if (!this.client) {
      throw new Error('Client not connected')
    }
  }

  async getDescription() {
    // make sure client is initialized
    await this.assertClient()

    // defer to parent class
    return unsafeRun(async () => {
      return super.getDescription()
    })
  }

  protected getMethod(...path: string[]): AsyncMethod {
    // use existing method definition 
    const method = super.getMethod(...path)

    // wrap in unsafeRun
    return async (payload: any) => {
      // make sure client is initialized
      await this.assertClient()

      return unsafeRun(async () => {
        return method(payload)
      })
    }
  }
}

export class AsyncService extends SoapService {
  constructor(client: Client) {
    super()
    this.client = client
  }
}