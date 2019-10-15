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
