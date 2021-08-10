const fs = require("fs");
const inlinePrefix = "inline!";
const base64Prefix = "base64!";

const plugin = (options) => {
  const sources = new Map();

  return {
    name: "rollup-plugin-inline",

    resolveId: (sourcePath) => {
      if (sourcePath.startsWith(inlinePrefix)) {
        const nextSourcePath = sourcePath.slice(inlinePrefix.length);
        sources.set(nextSourcePath, "inline");
        return nextSourcePath;
      }

      if (sourcePath.startsWith(base64Prefix)) {
        const nextSourcePath = sourcePath.slice(base64Prefix.length);
        sources.set(nextSourcePath, "base64");
        return nextSourcePath;
      }

      return null;
    },
    transform: (codeContent, id) => {
      if (sources.has(id)) {
        const transform = sources.get(id);
        const source =
          transform === "base64"
            ? fs.readFileSync(id).toString("base64")
            : codeContent;

        const code = `export default ${JSON.stringify(source)};`;
        const map = { mappings: "" };
        return {
          code,
          map,
        };
      }
      return null;
    },
  };
};

module.exports = plugin;
