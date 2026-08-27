import { defineConfig, mergeConfig } from 'vitest/config';
import { baseTestConfig } from '../../configs/test/vitest.base.ts';

export default mergeConfig(
  baseTestConfig,
  defineConfig({
    test: {
      // Scaffold has no tests yet; drop this when the first suite lands.
      passWithNoTests: true,
    },
  }),
);
