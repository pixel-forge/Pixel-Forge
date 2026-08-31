import { defineConfig, mergeConfig } from 'vitest/config';
import { baseTestConfig } from '../../configs/test/vitest.base.ts';

export default mergeConfig(
  baseTestConfig,
  defineConfig({
    test: {
      coverage: {
        all: false,
      },
    },
  }),
);
