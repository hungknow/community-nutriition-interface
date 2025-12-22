import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/styles/globals.css"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  treeshake: true,
  minify: false,
  esbuildOptions(options) {
    options.tsconfig = "./tsconfig.json"
  },
})
