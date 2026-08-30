import { hostname } from 'node:os';
import { pid } from 'node:process';
import { inspect } from 'node:util';
import { afterEach, beforeEach, vi } from 'vitest';
import { LogLevel } from '../../../src/index';
import { NodeLogger } from '../../../src/logger/node-logger';
import {
    inspectDepth,
    inspectMaxArrayLength,
    inspectMaxStringLength,
} from '../../../src/logger/node-logger/consts';
import { stdoutSupportsColor } from '../../../src/logger/node-logger/stdoutSupportsColor';
import {
    LogLevelBackgroundColors,
    LogLevelForegroundColors,
    TimestampBackgroundColor,
    TimestampForegroundColor,
} from '../../../src/logger/_shared/consts';

vi.mock('../../../src/logger/node-logger/stdoutSupportsColor', () => ({
    stdoutSupportsColor: vi.fn(() => true),
}));

const NOW = 1_700_000_000_000;

class TimestampProbe extends NodeLogger {
    public now(): string {
        return this.composeTimestamp();
    }

    public prefix(level: LogLevel): string {
        return this.composePrefix(level);
    }
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(stdoutSupportsColor).mockReturnValue(true);
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

function firstArg(spy: typeof console.log | typeof console.group): string {
    const mocked = vi.mocked(spy);
    expect(mocked).toHaveBeenCalled();
    const args = mocked.mock.calls[0];
    expect(args).toBeDefined();
    expect(args).toHaveLength(1);
    const title = args?.[0];
    expect(typeof title).toBe('string');
    return title as string;
}

function hexRgb(hex: string): { r: number; g: number; b: number } {
    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
    };
}

function expectTitleChrome(
    title: string,
    options: { level: LogLevel; tag: string; folded?: string },
): void {
    const probe = new TimestampProbe();
    const time = probe.now();
    const fg = hexRgb(LogLevelForegroundColors[options.level]);
    const bg = hexRgb(LogLevelBackgroundColors[options.level]);
    const timeFg = hexRgb(TimestampForegroundColor);
    const timeBg = hexRgb(TimestampBackgroundColor);
    expect(title).toContain(`38;2;${fg.r};${fg.g};${fg.b}`);
    expect(title).toContain(`48;2;${bg.r};${bg.g};${bg.b}`);
    expect(title).toContain(`38;2;${timeFg.r};${timeFg.g};${timeFg.b}`);
    expect(title).toContain(`48;2;${timeBg.r};${timeBg.g};${timeBg.b}`);
    expect(title).toContain(probe.prefix(options.level));
    expect(title).toContain(` · ${options.tag} `);
    expect(title).toContain(` ${time} `);
    if (options.folded !== undefined)
        expect(title).toContain(` ${options.folded}`);
}

function inspectOptions(colors = true) {
    return {
        depth: inspectDepth,
        maxStringLength: inspectMaxStringLength,
        maxArrayLength: inspectMaxArrayLength,
        colors,
    };
}

function inspected(value: object, colors = true): string {
    return inspect(value, inspectOptions(colors));
}

describe('NodeLogger', () => {
    describe('title chrome', () => {
        it('paints prefix, tag, and time with ANSI colors', () => {
            new NodeLogger('MyTag').logInfo('hello');
            expectTitleChrome(firstArg(console.log), {
                level: LogLevel.Info,
                tag: 'MyTag',
                folded: 'hello',
            });
        });

        it('uses an ISO UTC timestamp', () => {
            expect(new TimestampProbe().now()).toBe(new Date(NOW).toISOString());
        });

        it('uses the padded level word', () => {
            const logger = new NodeLogger('MyTag');
            logger.logWarning('watch');
            expectTitleChrome(firstArg(console.log), {
                level: LogLevel.Warning,
                tag: 'MyTag',
                folded: 'watch',
            });
        });

        it('skips ANSI when stdout has no color', () => {
            vi.mocked(stdoutSupportsColor).mockReturnValue(false);
            new NodeLogger('MyTag').logInfo('hello');
            const title = firstArg(console.log);
            expect(title).not.toContain('\x1b');
            expect(title).toContain(new TimestampProbe().prefix(LogLevel.Info));
            expect(title).toContain(' · MyTag ');
            expect(title.endsWith(' hello')).toBe(true);
        });

        it('omits process identity by default', () => {
            new NodeLogger('MyTag').logInfo('hello');
            expect(firstArg(console.log)).not.toContain(`${pid}@`);
        });

        it('appends pid@hostname when processIdentity is on', () => {
            const logger = new NodeLogger('MyTag');
            logger.setConfig({ processIdentity: true });
            logger.logInfo('hello');
            expect(firstArg(console.log)).toContain(`${pid}@${hostname()}`);
        });
    });

    describe('fold', () => {
        it('folds a lone string into one log line', () => {
            new NodeLogger('MyTag').logInfo('hello');
            expect(console.log).toHaveBeenCalledOnce();
            expect(console.group).not.toHaveBeenCalled();
        });

        it.each([42, true, 1n, undefined] as const)('folds %s into the title', (parcel) => {
            new NodeLogger('MyTag').logInfo(parcel);
            expectTitleChrome(firstArg(console.log), {
                level: LogLevel.Info,
                tag: 'MyTag',
                folded: String(parcel),
            });
            expect(console.group).not.toHaveBeenCalled();
        });

        it('does not fold an object first parcel', () => {
            new NodeLogger('MyTag').logInfo({ a: 1 });
            expectTitleChrome(firstArg(console.group), {
                level: LogLevel.Info,
                tag: 'MyTag',
            });
            expect(console.dir).toHaveBeenCalledWith({ a: 1 }, inspectOptions());
        });
    });

    describe('group', () => {
        it('groups when parcels remain after the folded title', () => {
            new NodeLogger('MyTag').logInfo('hello', { a: 1 });
            expectTitleChrome(firstArg(console.group), {
                level: LogLevel.Info,
                tag: 'MyTag',
                folded: 'hello',
            });
            expect(console.dir).toHaveBeenCalledWith({ a: 1 }, inspectOptions());
            expect(console.groupEnd).toHaveBeenCalledOnce();
            expect(console.groupCollapsed).not.toHaveBeenCalled();
        });
    });

    describe('parcels', () => {
        it('dirs a plain object when foldObject is true', () => {
            new NodeLogger('MyTag').logInfo({ a: 1 });
            expect(console.dir).toHaveBeenCalledWith({ a: 1 }, inspectOptions());
            expect(console.log).not.toHaveBeenCalled();
        });

        it('logs a plain object when foldObject is false', () => {
            const logger = new NodeLogger('MyTag');
            logger.setConfig({ foldObject: false });
            logger.logInfo({ a: 1 });
            expect(console.log).toHaveBeenCalledWith(inspected({ a: 1 }));
            expect(console.dir).not.toHaveBeenCalled();
        });

        it.each([
            new Error('boom'),
            new Date(NOW),
            /x/,
            null,
        ])('logs %s instead of dir', (parcel) => {
            new NodeLogger('MyTag').logInfo(parcel);
            expect(console.log).toHaveBeenCalledWith(parcel);
            expect(console.dir).not.toHaveBeenCalled();
        });

        it('does not table object arrays by default', () => {
            const rows = [{ a: 1 }, { a: 2 }];
            new NodeLogger('MyTag').logInfo(rows);
            expect(console.table).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(inspected(rows));
        });

        it('tables an array of plain objects when tableObjectArrays is true', () => {
            const rows = [{ a: 1 }, { a: 2 }];
            const logger = new NodeLogger('MyTag');
            logger.setConfig({ tableObjectArrays: true });
            logger.logInfo(rows);
            expect(console.table).toHaveBeenCalledWith(rows);
            expect(console.log).not.toHaveBeenCalled();
        });

        it('does not table arrays that are not all plain objects', () => {
            const rows = [{ a: 1 }, new Date(NOW)];
            const logger = new NodeLogger('MyTag');
            logger.setConfig({ tableObjectArrays: true });
            logger.logInfo(rows);
            expect(console.table).not.toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith(inspected(rows));
        });
    });

    describe('trace', () => {
        it('groups and traces when trace is on with no remaining parcels', () => {
            const logger = new NodeLogger('MyTag');
            logger.setConfig({ trace: true });
            logger.logInfo('hello');
            expect(console.log).not.toHaveBeenCalled();
            expect(console.group).toHaveBeenCalledOnce();
            expect(console.trace).toHaveBeenCalledOnce();
            expect(console.groupEnd).toHaveBeenCalledOnce();
        });
    });

    describe('filtering', () => {
        it('does not print below the minimum level', () => {
            new NodeLogger('MyTag').logDebug('hidden');
            expect(console.log).not.toHaveBeenCalled();
            expect(console.group).not.toHaveBeenCalled();
        });
    });
});
