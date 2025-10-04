import { vi } from 'vitest';
import { sleep } from '../../src/timing';

describe('Timing - Timers tests', () => {
  it('Sleep', async () => {
    vi.useFakeTimers();
    const result = sleep(200);
    await vi.advanceTimersByTimeAsync(200);
    await expect(result).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});