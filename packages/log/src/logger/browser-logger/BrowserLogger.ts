import { Logger } from '../_shared/Logger';
import type { LogLevel, LogParcel } from '../_shared/types';

export class BrowserLogger extends Logger {
    constructor(tag: string) {
        super(tag);
    }

    public override log(level: LogLevel, parcels: LogParcel[]): void {}
}
