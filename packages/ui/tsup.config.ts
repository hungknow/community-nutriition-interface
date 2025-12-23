import { defineConfig } from "tsup"
import { fixImportsPlugin } from "esbuild-fix-imports-plugin"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/styles/globals.css",
    "src/components/ui/**/*.tsx",
    "src/lib/**/*.ts",
  ],
  format: ["esm"],
  dts: true,
  bundle: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  treeshake: true,
  minify: false,
  esbuildPlugins: [fixImportsPlugin()],
  esbuildOptions(options) {
    options.tsconfig = "./tsconfig.json"
  },
})
