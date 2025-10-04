import { defineConfig, mergeConfig } from 'vitest/config';
import { baseTestConfig } from '../../configs/test/vitest.base';

export default mergeConfig(baseTestConfig, defineConfig({}));
