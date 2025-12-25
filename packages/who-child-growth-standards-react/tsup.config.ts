import { defineConfig } from "tsup"
import { fixImportsPlugin } from "esbuild-fix-imports-plugin"
import { copy } from "esbuild-plugin-copy"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/!(*.fixture|*.test).{ts,tsx}",
    "src/atoms/!(*.fixture|*.test).{ts,tsx}",
    "src/i18n/!(*.fixture|*.test).{ts,tsx}",
    "src/utils/!(*.fixture|*.test).{ts,tsx}",
    "src/hooks/!(*.fixture|*.test).{ts,tsx}",
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
  esbuildPlugins: [
    fixImportsPlugin(),
    copy({
      // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
      // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
      resolveFrom: 'cwd',
      assets: [
        {
          from: 'src/i18n/*.json',
          to: 'dist/i18n',
        }
      ]
    }),
  ],
  esbuildOptions(options) {
    options.tsconfig = "./tsconfig.json"
  },
})
