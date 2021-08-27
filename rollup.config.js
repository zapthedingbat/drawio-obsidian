import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import clear from "rollup-plugin-clear";
import inline from "./rollup-plugin-inline";
import { storeBundle, retrieveBundle } from "./rollup-plugin-output-as-module";

const banner = `/*
Draw.io Diagrams Obsidian Plugin
2021 - Sam Greenhalgh - https://radicalresearch.co.uk/
*/
`;

const chunkCache = new Map();

export default [
  {
    input: "./src/drawio-client/init/index.ts",
    output: {
      name: "init",
      file: "./dist/init.js",
      format: "iife",
      banner,
      sourcemap: true,
    },
    plugins: [
      storeBundle(chunkCache),
      inline(),
      typescript({
        tsconfig: "./tsconfig.es5.json",
      }),
    ],
  },
  {
    input: "./src/drawio-client/app/index.ts",
    output: {
      name: "app",
      file: "./dist/app.js",
      format: "iife",
      banner,
      sourcemap: true,
    },
    plugins: [
      storeBundle(chunkCache),
      inline(),
      typescript({
        tsconfig: "./tsconfig.es5.json",
      }),
    ],
  },
  {
    input: "./src/DiagramPlugin.ts",
    output: {
      file: "./dist/main.js",
      format: "cjs",
      exports: "default",
      banner,
      sourcemap: true,
    },
    external: ["obsidian"],
    plugins: [
      clear({ targets: ["./dist"] }),
      retrieveBundle(chunkCache),
      inline(),
      typescript({ sourceMap: true, inlineSources: true }),
      nodeResolve({ browser: true }),
      commonjs(),
      copy({
        targets: [
          { src: "./src/assets/manifest.json", dest: "./dist" },
          { src: "./src/assets/styles.css", dest: "./dist" },
        ],
      }),
    ],
  },
];
