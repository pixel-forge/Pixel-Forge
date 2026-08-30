import { LogLevel, type LogParcel } from '../../../src/index';
import { Logger } from '../../../src/logger/_shared/Logger';

class TestLogger extends Logger {
    public readonly calls: { level: LogLevel; parcels: LogParcel[] }[] = [];

    public override log(level: LogLevel, ...parcels: LogParcel[]): void {
        if (!this.canLog(level))
            return;
        this.calls.push({ level, parcels });
    }

    public getTag(): string {
        return this.tag;
    }
}

describe('Logger', () => {
    it('drops below the minimum level', () => {
        const logger = new TestLogger();
        logger.logDebug('hidden');
        expect(logger.calls).toEqual([]);
        logger.setMinimumLogLevel(LogLevel.Debug);
        logger.logDebug('shown');
        expect(logger.calls).toEqual([{ level: LogLevel.Debug, parcels: ['shown'] }]);
    });

    it('drops when disabled', () => {
        const logger = new TestLogger();
        logger.setEnabled(false);
        logger.logInfo('hidden');
        expect(logger.calls).toEqual([]);
    });

    it('forwards logInfo to log', () => {
        const logger = new TestLogger('Tag');
        logger.logInfo('a', 1);
        expect(logger.calls).toEqual([{ level: LogLevel.Info, parcels: ['a', 1] }]);
    });

    it.each([
        ['logVerbose', LogLevel.Verbose],
        ['logDebug', LogLevel.Debug],
        ['logWarning', LogLevel.Warning],
        ['logError', LogLevel.Error],
    ] as const)('%s forwards to log', (method, level) => {
        const logger = new TestLogger();
        logger.setMinimumLogLevel(LogLevel.Verbose);
        logger[method]('x');
        expect(logger.calls).toEqual([{ level, parcels: ['x'] }]);
    });

    it('defaults the tag to the class name', () => {
        expect(new TestLogger().getTag()).toBe('TestLogger');
    });
});
