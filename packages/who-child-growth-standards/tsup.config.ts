import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/*.ts"],
  format: ["esm"],
  dts: true,
  bundle: false,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: [],
  treeshake: true,
  minify: false,
  esbuildOptions(options) {
    options.tsconfig = "./tsconfig.json"
  },
})
