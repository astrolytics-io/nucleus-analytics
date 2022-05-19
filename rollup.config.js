import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import ignore from "rollup-plugin-ignore"
import { terser } from "rollup-plugin-terser"

export default {
  input: "src/index.js",
  inlineDynamicImports: true,
  output: {
    file: "dist/index.js",
    format: "umd",
    name: "Nucleus",
  },
  plugins: [
    // ignore modules only in node
    ignore(["ws", "electron", "node-machine-id", "conf", "os-locale"]),
    resolve(),
    commonjs(),
    json(),
    terser(),
  ],
}
