import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./src/test/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts", "src/app/api/**/route.ts"],
      exclude: [
        "src/lib/stripe.ts",
        "src/lib/cart-hydration.ts",
        "src/test/**",
      ],
      thresholds: {
        statements: 75,
        branches: 70,
        functions: 70,
        lines: 75,
      },
    },
  },
});
