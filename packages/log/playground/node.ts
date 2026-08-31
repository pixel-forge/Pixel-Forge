import { LogLevel } from '../src/index';
import { NodeLogger } from '../src/logger/node-logger';

const logger = new NodeLogger('Playground');
logger.setMinimumLogLevel(LogLevel.Verbose);

logger.logVerbose('verbose string');
logger.logDebug('debug string');
logger.logInfo('info string');
logger.logWarning('warning string');
logger.logError('error string');
//Process identity
logger.setConfig({ processIdentity: true });
logger.logInfo('with process identity');
logger.setConfig({ processIdentity: false });
//Folded title
logger.logInfo('folded title', { nested: true, count: 2 });
//Only object
logger.logInfo({ only: 'object' });
//Error
logger.logError(new Error('boom'));
//Date
logger.logInfo(new Date());
//Pattern
logger.logInfo(/pattern/g);
//Array
logger.logInfo([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
logger.logInfo([1, 2, 3]);

logger.logInfo('deeper than inspect depth', {
    a: { b: { c: { d: { e: { f: 1 } } } } },
});
logger.logInfo('long string', { text: 'x'.repeat(800) });
logger.logInfo(
    'long array',
    Array.from({ length: 40 }, (_, i) => i),
);

logger.setConfig({ foldObject: false });
logger.logInfo({ foldObject: false, nested: { ok: true } });
logger.setConfig({ foldObject: true, tableObjectArrays: true });
logger.logInfo([
    { a: 1, b: 2 },
    { a: 3, b: 4 },
]);
logger.setConfig({ tableObjectArrays: false, trace: true });
logger.logInfo('with trace');
