import { Client } from 'soap';
import { asyncMethod, parseFormatted, parseEmbedded } from './method';
import { AsyncMethod, MethodResult } from './types';
import { unsafeClient, unsafeRun } from './unsafe';
import { timeout, retry } from './utils';
import Logger = require('bunyan');

export class SoapService {
  protected readonly methods = {};
  protected client: Client;

  /**
   * Proxy to `Client.describe`
   */
  getDescription(): Promise<any> {
    return this.client.describe();
  }

  call(arg: {}, ...path: string[]): Promise<MethodResult> {
    let method = this.getMethod(...path);
    return method(arg);
  }

  callEmbedded<T>(arg: {}, ...path: string[]): Promise<T> {
    let method = this.getMethod(...path);
    return method(arg).then(parseEmbedded(path));
  }

  callFormatted(arg: {}, ...path: string[]): Promise<string> {
    let method = this.getMethod(...path);
    return method(arg).then(parseFormatted(path));
  }

  protected getMethod(...path: string[]): AsyncMethod {
    let key = path.join('.');
    // cache method for later use
    if (!this.methods[key]) {
      this.methods[key] = asyncMethod(this.client, ...path);
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
      throw new Error('Client not connected');
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
