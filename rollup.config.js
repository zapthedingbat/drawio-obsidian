import { resolve as resolvePath } from "path";
import { existsSync } from "fs";
import sucrase from "@rollup/plugin-sucrase";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import clear from "rollup-plugin-clear";
import inline from "./rollup-plugin-inline";
import { storeBundle, retrieveBundle } from "./rollup-plugin-output-as-module";

const banner = `/*
Draw.io Diagrams Obsidian Plugin
2021 - Sam Greenhalgh - https://radicalresearch.co.uk/
*/
`;

// Transpile-only TypeScript via sucrase. No type-checking is performed, which
// deliberately sidesteps the third-party .d.ts parsing problems (e.g.
// @codemirror's `export { type X }` syntax) that broke @rollup/plugin-typescript
// when resolved against an older TypeScript. We restrict it to real .ts/.tsx
// source files so it never re-processes the JS strings synthesized by the
// inline!/base64!/bundle! resolvers.
const transpile = () =>
  sucrase({
    include: ["**/*.ts", "**/*.tsx"],
    exclude: ["**/*.d.ts", "node_modules/**"],
    transforms: ["typescript"],
  });

// Replicate the tsconfig `baseUrl: "."` resolution that @rollup/plugin-typescript
// performed implicitly. Sucrase only resolves relative ("./", "../") imports, so
// bare project-root imports such as `src/Messages` would otherwise be treated as
// external. Map them back onto real source files under the repo root.
const baseUrl = () => ({
  name: "rollup-plugin-baseurl-resolve",
  resolveId(importee) {
    if (/^(src|typings)\//.test(importee)) {
      const base = resolvePath(__dirname, importee);
      const candidates = [
        `${base}.ts`,
        `${base}.tsx`,
        `${base}/index.ts`,
        `${base}/index.tsx`,
        base,
      ];
      const match = candidates.find((candidate) => existsSync(candidate));
      if (match) {
        return match;
      }
    }
    return null;
  },
});

const chunkCache = new Map();

export default [
  {
    input: "./src/drawio-client/init/index.ts",
    output: {
      name: "init",
      file: "./dist/init.js",
      format: "iife",
      banner,
    },
    plugins: [
      baseUrl(),
      inline(),
      transpile(),
      terser({ ecma: 5 }),
      storeBundle(chunkCache),
    ],
  },
  {
    input: "./src/drawio-client/app/index.ts",
    output: {
      name: "app",
      file: "./dist/app.js",
      format: "iife",
      banner,
    },
    plugins: [
      baseUrl(),
      inline(),
      transpile(),
      terser({ ecma: 5 }),
      storeBundle(chunkCache),
    ],
  },
  {
    input: "./src/DiagramPlugin.ts",
    output: [
      {
        file: "./dist/main.js",
        format: "cjs",
        exports: "default",
        banner,
      },
    ],
    external: ["obsidian"],
    plugins: [
      clear({ targets: ["./dist"] }),
      baseUrl(),
      retrieveBundle(chunkCache),
      inline(),
      transpile(),
      // Keep the iframe-transport bootstrap identifier readable in the output so
      // the mobile srcdoc transport patch stays greppable/diagnosable. Reserving
      // it from the mangler is not enough on its own: terser's single-use
      // variable inlining (reduce_vars/collapse_vars) would otherwise eliminate
      // the `const bootstrapHtml` entirely before mangling runs. Keeping that one
      // local intact costs nothing measurable (the large drawio payload is a
      // single string literal that these passes do not touch).
      terser({
        mangle: { reserved: ["bootstrapHtml"] },
        compress: { reduce_vars: false, collapse_vars: false },
      }),
      copy({
        targets: [
          { src: "./manifest.json", dest: "./dist" },
          { src: "./src/assets/styles.css", dest: "./dist" },
        ],
      }),
    ],
  },
];
