import { $ } from "bun";
import { build, type Options } from "tsup";
import { rimraf } from "rimraf";

await rimraf("dist");
const tsupConfig: Options = {
  entry: ["src/**/*.ts"],
  splitting: false,
  sourcemap: false,
  clean: true,
  bundle: true,
} satisfies Options;

await Promise.all([
  build({
    outDir: "dist",
    format: "esm",
    target: "node20",
    cjsInterop: false,
    ...tsupConfig,
  }),

  build({
    outDir: "dist/cjs",
    format: "cjs",
    target: "node20",
    ...tsupConfig,
  }),
]);

await $`bun tsc --emitDeclarationOnly --project tsconfig.types.json `;

await $`cp dist/*.d.ts dist/cjs`;

await rimraf('tsconfig.types.tsbuildinfo')

process.exit();
