import Logger = require('bunyan');

export function compose(...fns: any[]): any {
  return fns.reduce((fall, f) => {
    return (...args: any[]) => fall(f(...args));
  });
}

export function composeAsync(
  f: (x: any) => any,
  g: (...xs: any[]) => Promise<any>
): any {
  return async (...args: any[]) => f(await g(...args));
}

export function timeout(milli: number) {
  return new Promise(resolve => {
    setTimeout(resolve, milli);
  });
}

export async function retry(
  logger: Logger,
  f: () => any,
  delay = 3000,
  max = 3
) {
  try {
    return await f();
  } catch (err) {
    // error out.
    if (max == 0) throw err;

    // notify user
    logger.error({ err });
    logger.info('Retrying...');

    // retry
    await timeout(delay);
    return await retry(logger, f, delay * 2, max - 1);
  }
}
