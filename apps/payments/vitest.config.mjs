import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Only TS sources — never the compiled JS mirror under dist/.
    include: ['src/**/*.{spec,test}.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
