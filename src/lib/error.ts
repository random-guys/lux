import { MethodResult } from "./types";

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