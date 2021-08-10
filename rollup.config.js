import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import clear from "rollup-plugin-clear";
const inline = require("./rollup-plugin-inline");
import { storeBundle, retrieveBundle } from "./rollup-plugin-output-as-module";

const banner = `/*
Draw.io Diagrams Obsidian Plugin
2021 - Sam Greenhalgh - https://radicalresearch.co.uk/
*/
`;

const chunkCache = new Map();

export default [
  {
    input: "./src/drawio-frame/main.ts",
    output: {
      dir: "./dist",
      format: "iife",
      banner,
    },
    plugins: [
      storeBundle(chunkCache),
      inline(),
      typescript({}),
      nodeResolve({ browser: true }),
      commonjs(),
    ],
  },
  {
    input: "./src/DiagramPlugin.ts",
    output: {
      file: "./dist/main.js",
      format: "cjs",
      exports: "default",
      banner,
    },
    external: ["obsidian"],
    plugins: [
      clear({ targets: ["./dist"] }),
      retrieveBundle(chunkCache),
      inline(),
      typescript({}),
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
