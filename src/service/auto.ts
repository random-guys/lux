import Logger from "bunyan";
import { Client, createClient } from "soap";
import { AsyncMethod } from "../methods";
import { unsafeClient, unsafeRun } from "../unsafe";
import { retry } from "../utils";
import { SoapService } from "./base";

/**
 * `AutoService` is a service that can manage it's own `Client`. It automatically
 * tries to connect and ensures methods are not called until the client is connected.
 * This essentially reduces a SOAP service to a `URL` and it's methods.
 */
export class AutoService extends SoapService {
  private connection: Promise<void>;

  /**
   * Create an instance of an `AutoService` and connect the client. It fails to
   * connect, it will retry 2 more times.
   * @param url WSDL URL of the SOAP service
   * @param logger bunyan logger to help track connection status
   * @param wait time between retries in milliseconds. Set this to `0` to turn
   * off retries
   */
  constructor(url: string, logger: Logger, wait = 0) {
    super();
    this.connection = this.runInit(url, logger, wait);
  }

  private async runInit(url: string, logger: Logger, wait: number) {
    if (wait === 0) {
      this.client = await this.createClient(url, logger);
    } else {
      return await retry(logger, async () => {
        this.client = await this.createClient(url, logger);
      });
    }
  }

  protected async createClient(url: string, logger: Logger) {
    return new Promise<Client>((resolve, reject) => {
      createClient(url, (err, client) => {
        if (err) return reject(err);
        logger.info(`${this.constructor.name} is connected`);
        resolve(client);
      });
    });
  }

  /**
   * `assertClient` makes sure the client is connected and throws an
   * error if the client fails to connect(and such failure doesn't raise
   * an execption)
   */
  protected async assertClient() {
    await this.connection;

    if (!this.client) {
      throw new Error("Client not connected");
    }
  }

  async getDescription() {
    await this.assertClient();
    return super.getDescription();
  }

  protected getMethod(...path: string[]): AsyncMethod {
    return async (payload: any) => {
      await this.assertClient();
      const method = super.getMethod(...path);

      return unsafeRun(async () => {
        return method(payload);
      });
    };
  }
}

export class UnsafeAutoService extends AutoService {
  protected async createClient(url: string, logger: Logger) {
    return unsafeRun(() => {
      return unsafeClient(url);
    });
  }
}
