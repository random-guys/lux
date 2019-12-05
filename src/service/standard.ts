import { SoapService } from "./base";
import { Client } from "soap";

export class StandardService extends SoapService {
  constructor(client: Client) {
    super();
    this.client = client;
  }
}
