import { LogLevel } from '../src/index';
import { BrowserLogger } from '../src/logger/browser-logger';

const logger = new BrowserLogger('Playground');
logger.setMinimumLogLevel(LogLevel.Verbose);

function readConfig(): void {
  logger.setConfig({
    collapsedGroups: (document.getElementById('collapsedGroups') as HTMLInputElement).checked,
    foldObject: (document.getElementById('foldObject') as HTMLInputElement).checked,
    tableObjectArrays: (document.getElementById('tableObjectArrays') as HTMLInputElement).checked,
    trace: (document.getElementById('trace') as HTMLInputElement).checked,
  });
}

function logSamples(): void {
  readConfig();
  logger.logVerbose('verbose string');
  logger.logDebug('debug string');
  logger.logInfo('info string');
  logger.logWarning('warning string');
  logger.logError('error string');
  logger.logInfo('folded title', { nested: true, count: 2 });
  logger.logInfo({ only: 'object' });
  logger.logInfo(new Error('boom'));
  logger.logInfo(new Date());
  logger.logInfo(/pattern/g);
  logger.logInfo([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
  logger.logInfo([1, 2, 3]);
}

document.getElementById('log-samples')?.addEventListener('click', logSamples);
logSamples();
