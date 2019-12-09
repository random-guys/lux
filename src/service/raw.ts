import axios, { AxiosInstance } from "axios";
import { js2xml2, xmlConvOpt } from "../xml2js";

export class RawService {
  protected axios: AxiosInstance;
  constructor(
    url: string,
    credential?: Credential,
    private namespaces?: object,
    private headers?: object
  ) {
    this.axios = axios.create({
      baseURL: url,
      headers: {
        "Content-Type": "text/xml"
      },
      responseType: "text"
    });

    if (credential) {
      const authCode = Buffer.from(
        `${credential.username}:${credential.password}`
      ).toString("base64");
      this.axios.defaults.headers["Authorization"] = `Basic ${authCode}`;
    }
  }

  protected toSoap(method: string, arg: object) {
    return {
      "soapenv:Envelope": {
        _attributes: {
          "xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
          ...parseNamespaces(this.namespaces)
        },
        "soapenv:Header": this.headers || {},
        "soapenv:Body": {
          [`${method}`]: arg
        }
      }
    };
  }

  protected async call(method: string, arg: object) {
    const request = js2xml2(xmlConvOpt, this.toSoap(method, arg));
    try {
      const response = await this.axios.post("", request);
      // console.log(response);
    } catch (err) {
      console.log(request);
      console.log(err.response.data);
    }
  }
}

export interface Credential {
  username: string;
  password: string;
}

/**
 *
 * @param namespaces
 */
function parseNamespaces(namespaces?: object) {
  const result = {};

  if (namespaces) {
    Object.keys(namespaces).forEach(key => {
      result[`xmlns:${key}`] = namespaces[key];
    });
  }

  return result;
}
