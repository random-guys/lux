import Logger = require("bunyan");

/**
 * compose creates a function that pipelines the results of the passed functions
 * right to left.
 * @param fns List of functions to pipeline
 */
export function compose(...fns: any[]): any {
  return fns.reduce((fall, f) => {
    return (...args: any[]) => fall(f(...args));
  });
}

/**
 * timeout creates a `Promise` that resolves in `time` timeseconds
 * @param time timeout in milliseconds
 */
export function timeout(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

/**
 * retry trys action `f` till it succeeds(doesn't throw an exception) at most
 * `max` times
 * @param logger logger to track errors even while retrying
 * @param f action to be run
 * @param delay delay before retries in milliseconds, defaults to `3000`
 * @param max maximum number of retries before giving up, defaults to `3`
 */
export async function retry(
  logger: Logger,
  f: () => Promise<any>,
  delay = 3000,
  max = 3
) {
  try {
    return await f();
  } catch (err) {
    if (max == 0) throw err;

    logger.error({ err });
    logger.info("Retrying...");

    await timeout(delay);
    return await retry(logger, f, delay * 2, max - 1);
  }
}
