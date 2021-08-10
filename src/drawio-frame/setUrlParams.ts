import { UrlParams } from "drawio";

export function setUrlParams(params: UrlParams) {
  const urlParamsProxy = new Proxy(params, {
    get(target, propertyKey, receiver) {
      const value = Reflect.get(target, propertyKey, receiver);
      if (propertyKey === "pv") {
        console.log(`get urlParams.${String(propertyKey)}`, value);
      }
      return value;
    },
    set(target, propertyKey, value, receiver) {
      //console.log(`set urlParams.${String(propertyKey)}`, value);
      return true;
    },
  });

  Object.defineProperty(window, "urlParams", {
    value: urlParamsProxy,
  });
}
