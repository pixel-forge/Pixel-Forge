import { LogLevelPrefix } from '../_shared/consts';
import { Logger } from '../_shared/Logger';
import type { LogLevel, LogParcel } from '../_shared/types';

export class BrowserLogger extends Logger {
    constructor(tag: string) {
        super(tag);
    }

    private composeTitle (level: LogLevel): string {
        const now = Date.now();
        return `%c${LogLevelPrefix[level]} %c${this.tag} %c${now}`;
    }

    public override log(level: LogLevel, ...parcels: LogParcel[]): void {
        if(!this.canLog(level))
            return;

        let title = this.composeTitle(level);

        //Fold first parcel into the title
        if(typeof parcels[0] !== 'object') {
            title += '\n';
            title += String(parcels.shift());
        }

        if(!parcels.length) {}
    }

    private log_Single (title: string) {
        console.log(title);
    }
}
