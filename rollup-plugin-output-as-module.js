import { relative, posix, sep } from "path";
const prefix = "bundle!";

export function storeBundle(cache) {
  return {
    name: "rollup-plugin-store-chunks",
    generateBundle(options, bundle, isWrite) {
      const bundleNames = Object.keys(bundle);
      bundleNames.forEach((name) => {
        const output = bundle[name];
        const relativePath = relative("", output.facadeModuleId)
          .split(sep)
          .join(posix.sep);
        console.log("store", relativePath);
        cache.set(relativePath, output.code);
      });
      bundleNames.forEach((name) => {
        delete bundle[name];
      });
    },
  };
}

export function retrieveBundle(cache) {
  return {
    name: "rollup-plugin-retrieve-chunks",
    resolveId: (id) => {
      if (id.startsWith(prefix)) {
        const name = id.slice(prefix.length);
        if (cache.has(name)) {
          return name;
        }
      }
      return null;
    },
    load(id) {
      if (cache.has(id)) {
        return cache.get(id);
      }
      return null;
    },
    transform: (codeContent, id) => {
      if (cache.has(id)) {
        console.log("retrieve", id);
        const code = `export default ${JSON.stringify(codeContent)};`;
        const map = { mappings: "" };
        return {
          code,
          map,
        };
      }
      return null;
    },
  };
}
