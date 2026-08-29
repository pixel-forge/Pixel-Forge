import { afterEach, beforeEach, vi } from 'vitest';
import { LogLevel } from '../../../src/index';
import { BrowserLogger } from '../../../src/logger/browser-logger';
import {
    LogLevelBackgroundColors,
    LogLevelForegroundColors,
    LogLevelPrefix,
} from '../../../src/logger/_shared/consts';

const NOW = 1_700_000_000_000;

class TimestampProbe extends BrowserLogger {
    public now(): string {
        return this.composeTimestamp();
    }
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'dir').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
    vi.spyOn(console, 'trace').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
});

function firstArgs(spy: typeof console.log | typeof console.group | typeof console.groupCollapsed): unknown[] {
    const mocked = vi.mocked(spy);
    expect(mocked).toHaveBeenCalled();
    const args = mocked.mock.calls[0];
    expect(args).toBeDefined();
    return args as unknown[];
}

function expectTitleChrome(
    args: unknown[],
    options: { level: LogLevel; tag: string; folded?: string },
): void {
    const time = new TimestampProbe().now();
    const folded = options.folded === undefined ? '' : ` ${options.folded}`;
    expect(args[0]).toBe(
        `%c${LogLevelPrefix[options.level]}%c ${options.tag} %c${time}%c${folded}`,
    );
    expect(args).toHaveLength(5);
    const fg = LogLevelForegroundColors[options.level];
    const bg = LogLevelBackgroundColors[options.level];
    expect(args[1]).toContain(`color: ${fg}`);
    expect(args[1]).toContain(`background: ${bg}`);
    expect(args[2]).toContain(`color: ${bg}`);
    expect(args[3]).toContain(`color: ${fg}`);
    expect(args[3]).toContain(`background: ${bg}`);
    expect(args[4]).toBe('font-weight: normal');
}

describe('BrowserLogger', () => {
    describe('title chrome', () => {
        it('passes four style args with level colors', () => {
            new BrowserLogger('MyTag').logInfo('hello');
            expectTitleChrome(firstArgs(console.log), {
                level: LogLevel.Info,
                tag: 'MyTag',
                folded: 'hello',
            });
        });

        it('uses the level prefix letter', () => {
            const logger = new BrowserLogger('MyTag');
            logger.logWarning('watch');
            expectTitleChrome(firstArgs(console.log), {
                level: LogLevel.Warning,
                tag: 'MyTag',
                folded: 'watch',
            });
        });
    });

    describe('fold', () => {
        it('folds a lone string into one log line', () => {
            new BrowserLogger('MyTag').logInfo('hello');
            expect(console.log).toHaveBeenCalledOnce();
            expect(console.groupCollapsed).not.toHaveBeenCalled();
        });

        it.each([42, true, 1n, undefined] as const)('folds %s into the title', (parcel) => {
            new BrowserLogger('MyTag').logInfo(parcel);
            expectTitleChrome(firstArgs(console.log), {
                level: LogLevel.Info,
                tag: 'MyTag',
                folded: String(parcel),
            });
            expect(console.groupCollapsed).not.toHaveBeenCalled();
        });

        it('does not fold an object first parcel', () => {
            new BrowserLogger('MyTag').logInfo({ a: 1 });
            expectTitleChrome(firstArgs(console.groupCollapsed), {
                level: LogLevel.Info,
                tag: 'MyTag',
            });
            expect(console.dir).toHaveBeenCalledWith({ a: 1 });
        });
    });

    describe('group', () => {
        it('groups when parcels remain after the folded title', () => {
            new BrowserLogger('MyTag').logInfo('hello', { a: 1 });
            expectTitleChrome(firstArgs(console.groupCollapsed), {
                level: LogLevel.Info,
                tag: 'MyTag',
                folded: 'hello',
            });
            expect(console.dir).toHaveBeenCalledWith({ a: 1 });
            expect(console.groupEnd).toHaveBeenCalledOnce();
            expect(console.group).not.toHaveBeenCalled();
        });

        it('uses console.group when collapsedGroups is false', () => {
            const logger = new BrowserLogger('MyTag');
            logger.setConfig({ collapsedGroups: false });
            logger.logInfo('hello', { a: 1 });
            expect(console.group).toHaveBeenCalledOnce();
            expect(console.groupCollapsed).not.toHaveBeenCalled();
            expect(console.groupEnd).toHaveBeenCalledOnce();
        });
    });

    describe('parcels', () => {
        it('dirs a plain object when foldObject is true', () => {
            new BrowserLogger('MyTag').logInfo({ a: 1 });
            expect(console.dir).toHaveBeenCalledWith({ a: 1 });
            expect(console.log).not.toHaveBeenCalled();
        });

        it('logs a plain object when foldObject is false', () => {
            const logger = new BrowserLogger('MyTag');
            logger.setConfig({ foldObject: false });
            logger.logInfo({ a: 1 });
            expect(console.log).toHaveBeenCalledWith({ a: 1 });
            expect(console.dir).not.toHaveBeenCalled();
        });

        it.each([
            new Error('boom'),
            new Date(NOW),
            /x/,
            null,
        ])('logs %s instead of dir', (parcel) => {
            new BrowserLogger('MyTag').logInfo(parcel);
            expect(console.log).toHaveBeenCalledWith(parcel);
            expect(console.dir).not.toHaveBeenCalled();
        });

        it('does not table object arrays by default', () => {
            const rows = [{ a: 1 }, { a: 2 }];
            new BrowserLogger('MyTag').logInfo(rows);
            expect(console.table).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(rows);
        });

        it('tables an array of plain objects when tableObjectArrays is true', () => {
            const rows = [{ a: 1 }, { a: 2 }];
            const logger = new BrowserLogger('MyTag');
            logger.setConfig({ tableObjectArrays: true });
            logger.logInfo(rows);
            expect(console.table).toHaveBeenCalledWith(rows);
            expect(console.log).not.toHaveBeenCalled();
        });

        it('does not table arrays that are not all plain objects', () => {
            const rows = [{ a: 1 }, new Date(NOW)];
            const logger = new BrowserLogger('MyTag');
            logger.setConfig({ tableObjectArrays: true });
            logger.logInfo(rows);
            expect(console.table).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(rows);
        });
    });

    describe('trace', () => {
        it('groups and traces when trace is on with no remaining parcels', () => {
            const logger = new BrowserLogger('MyTag');
            logger.setConfig({ trace: true });
            logger.logInfo('hello');
            expect(console.log).not.toHaveBeenCalled();
            expect(console.groupCollapsed).toHaveBeenCalledOnce();
            expect(console.trace).toHaveBeenCalledOnce();
            expect(console.groupEnd).toHaveBeenCalledOnce();
        });
    });

    describe('filtering', () => {
        it('does not print below the minimum level', () => {
            new BrowserLogger('MyTag').logDebug('hidden');
            expect(console.log).not.toHaveBeenCalled();
            expect(console.groupCollapsed).not.toHaveBeenCalled();
        });
    });
});
