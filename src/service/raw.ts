import axios, { AxiosInstance } from "axios";
import Logger from "bunyan";
import get from "lodash/get";
import {
  js2xml2,
  jsConvOpt,
  recursiveXml2js,
  xml2js2,
  xmlConvOpt
} from "../xml2js";

export interface RawServiceConfig {
  /**
   * Basic Authentication to add to request `Authorization` header
   */
  basicAuth?: {
    username: string;
    password: string;
  };
  /**
   * Namespaces to be declared at message root
   */
  namespaces?: object;
  /**
   * Tags to be added to the `<soapenv:Header>`
   */
  headers?: object;
  /**
   * Log requests and responses. Use wisely
   */
  debug?: boolean;
}

/**
 * `RawService` is a wrapper around axios for making SOAP requests. Unlike the `soap`
 * library, it doesn't attempt to connect or parse the entire service. Use this when any
 * of the other service doesn't work.
 */
export class RawService {
  /**
   * Configured axios instance for making all the requests. Use this instance to set defaults
   */
  protected axios: AxiosInstance;
  private namespaceAttrs: object = {
    "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/"
  };
  private config: RawServiceConfig = { debug: false };

  /**
   * Create a new RawService
   * @param url None WSDL URL of the service
   * @param config configuration for this RawService instance
   */
  constructor(url: string, config?: RawServiceConfig) {
    this.axios = axios.create({
      baseURL: url,
      headers: { "Content-Type": "text/xml" },
      responseType: "text"
    });
    this.config = { ...this.config, ...config };

    if (this.config.basicAuth) {
      this.basicAuth(this.config.basicAuth);
    }

    if (this.config.namespaces) {
      this.customNamespaces(this.config.namespaces);
    }
  }

  private basicAuth(auth: any) {
    const authCode = Buffer.from(`${auth.username}:${auth.password}`);
    this.axios.defaults.headers["Authorization"] = `Basic ${authCode.toString(
      "base64"
    )}`;
  }

  private customNamespaces(namespaces: object) {
    Object.keys(namespaces).forEach(key => {
      this.namespaceAttrs[`xmlns:${key}`] = namespaces[key];
    });
  }

  protected toSoap(method: string, data: object) {
    return {
      "soapenv:Envelope": {
        _attributes: this.namespaceAttrs,
        "soapenv:Header": this.config.headers || {},
        "soapenv:Body": {
          [`${method}`]: data
        }
      }
    };
  }

  protected async call(method: string, data: object) {
    const request = js2xml2(xmlConvOpt, this.toSoap(method, data));
    try {
      if (this.config.debug) {
        console.log(request);
      }
      const { data } = await this.axios.post("", request);

      if (this.config.debug) {
        console.log(data);
      }

      return recursiveXml2js(xml2js2(jsConvOpt, data));
    } catch (err) {
      const source = recursiveXml2js(xml2js2(jsConvOpt, err.response.data));
      throw new RawServiceError("Gaddam", getSoapFault(source));
    }
  }
}

export class RawServiceError extends Error {
  readonly source_error: any;

  constructor(message: string, source: any) {
    super(message);
    this.source_error = source;
  }
}

export function getSoapFault(data: any) {
  return get(data, "soap:Envelope.soap:Body.soap:Fault");
}
