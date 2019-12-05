import Logger from "bunyan";
import { Client } from "soap";
import { unsafeClient, unsafeRun } from "../unsafe";
import {
  AsyncMethod,
  createAsyncMethod,
  MethodPath,
  MethodResult,
  parseEmbedded,
  parseFormatted
} from "../methods";
import { retry } from "../utils";

export class SoapService {
  protected readonly methods = {};
  protected client: Client;

  /**
   * `getDescription` proxies to `Client.describe`
   */
  getDescription(): Promise<any> {
    return this.client.describe();
  }

  /**
   * `call` runs a method and returns the parsed XML directly
   * @param arg map of SOAP arguments
   * @param path path to SOAP method
   */
  call(arg: object, ...path: MethodPath): Promise<MethodResult> {
    let method = this.getMethod(...path);
    return method(arg);
  }

  /**
   * `callEmbedded` is like `call` but it extracts its result from
   * it's parent `${method_name}Result`
   * @param arg method argument
   * @param path method path
   */
  callEmbedded<T>(arg: object, ...path: MethodPath): Promise<T> {
    let method = this.getMethod(...path);
    return method(arg).then(parseEmbedded(path));
  }

  /**
   * `callFormatted` is like `callEmbedded` with response code inside the
   * extracted result in the following format `${error_code} | ${result}`
   * @param arg method argument
   * @param path method path
   */
  callFormatted(arg: object, ...path: MethodPath): Promise<string> {
    let method = this.getMethod(...path);
    return method(arg).then(parseFormatted(path));
  }

  /**
   * `getMethod` returns a function that asynchronously calls a SOAP method
   * @param path method path
   */
  protected getMethod(...path: MethodPath): AsyncMethod {
    let key = path.join(".");
    // cache method for later use
    if (!this.methods[key]) {
      this.methods[key] = createAsyncMethod(this.client, ...path);
    }
    return this.methods[key];
  }
}

export class UnsafeSyncService extends SoapService {
  private queue: Promise<void>;
  constructor(url: string, logger: Logger, canRetry = false) {
    super();

    // connect without security
    this.queue = unsafeRun(async () => this.connect(url, canRetry, logger));
  }

  private async connect(
    url: string,
    canRetry: boolean,
    logger: Logger,
    mill = 3000
  ) {
    if (!canRetry) {
      return await this.createClient(url, logger);
    }

    retry(logger, () => {
      return this.createClient(url, logger);
    });
  }

  private async createClient(url: string, logger: Logger) {
    this.client = await unsafeClient(url);
    logger.info(`${this.constructor.name} is connected`);
  }

  private async assertClient() {
    // wait for connection function
    await this.queue;

    // make sure client actually
    if (!this.client) {
      throw new Error("Client not connected");
    }
  }

  async getDescription() {
    // make sure client is initialized
    await this.assertClient();

    // defer to parent class
    return unsafeRun(async () => {
      return super.getDescription();
    });
  }

  protected getMethod(...path: string[]): AsyncMethod {
    // wrap in unsafeRun
    return async (payload: any) => {
      // make sure client is initialized
      await this.assertClient();
      // use existing method definition
      const method = super.getMethod(...path);

      return unsafeRun(async () => {
        return method(payload);
      });
    };
  }
}

export class AsyncService extends SoapService {
  constructor(client: Client) {
    super();
    this.client = client;
  }
}
