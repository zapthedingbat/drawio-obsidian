export function getPropertyOf<T>(obj: any, propertyKey: string): T {
  if (!(propertyKey in obj)) {
    throw new Error(
      `property ${propertyKey} does not exist on ${obj.toString()}`
    );
  }
  return obj[propertyKey] as T;
}
