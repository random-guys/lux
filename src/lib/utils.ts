/**
 * Describes a soap response from a soap service
 */
export interface MethodResult {
  [key: string]: string
}

/**
 * Error representing failed method calls.
 */
export class MethodError extends Error {
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