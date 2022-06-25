import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import ignore from "rollup-plugin-ignore"

import { terser } from "rollup-plugin-terser"

export default [
  {
    input: "src/index.js",
    inlineDynamicImports: true,
    output: {
      file: "dist/browser.js",
      format: "umd",
      name: "Nucleus",
    },
    // {
    //   file: "dist/index.mjs",
    //   format: "es",
    // },
    plugins: [
      // ignore modules only in node
      ignore([
        "os",
        "crypto",
        "ws",
        "electron",
        "node-machine-id",
        "conf",
        "os-locale",
      ]),
      resolve({
        browser: true,
      }),
      commonjs(),
      json(),
      terser(),
    ],
  },
  {
    input: "src/index.js",
    inlineDynamicImports: true,
    output: {
      file: "dist/index.js",
      format: "cjs",
    },
    plugins: [ignore(["clientjs"]), resolve(), commonjs(), json(), terser()],
  },
  {
    input: "src/index.js",
    inlineDynamicImports: true,
    output: {
      file: "dist/index.mjs",
      format: "es",
    },
    plugins: [resolve(), commonjs(), json(), terser()],
  },
]
