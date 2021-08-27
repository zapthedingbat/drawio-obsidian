// Utility function to patch methods of existing objects
export function patch(obj: any, name: string, factory: (...args: any[]) => {}) {
  const fn = obj[name];
  obj[name] = factory(fn);
}
