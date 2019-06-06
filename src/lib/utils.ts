/**
 * Basic Error class since ts decided to fuck up normal
 * exception inheritance
 */
export class BaseError {
  constructor(message: string) {
    Error.apply(this, message);
  }
}
BaseError.prototype = new Error();

/**
 * Describes a soap response from a soap service
 */
export interface MethodResult {
  [key: string]: string
}

/**
 * Error representing failed method calls.
 */
export class MethodError extends BaseError {
  constructor(
    public readonly code: string,
    public readonly result: MethodResult,
    message: string
  ) {
    super(message)
  }
}

/**
 * SOAP method as an async function
 */
export type MethodProxy = (arg: {}) => Promise<string>