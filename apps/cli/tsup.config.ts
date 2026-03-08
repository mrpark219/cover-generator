import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: true,
  clean: true,
  shims: true,
  noExternal: ["@cover-generator/cover-renderer", "@cover-generator/shared"]
});
