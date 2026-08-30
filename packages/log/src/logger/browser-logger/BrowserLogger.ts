import { isPlainObject } from '@pixel-forge/utils/object';
import { LogLevelBackgroundColors, LogLevelForegroundColors, TimestampBackgroundColor, TimestampForegroundColor } from '../_shared/consts';
import { Logger } from '../_shared/Logger';
import { LogLevel, type LogParcel } from '../_shared/types';
import type { Config } from './types';

type titleData = { titleString: string; designStrings: string[]; }

export class BrowserLogger
    extends Logger {

    constructor(tag?: string) {
        super(tag);
    }

    //######### Configuration #########

    private config: Config = {
        collapsedGroups: true,
        foldObject: true,
        tableObjectArrays: false,
        trace: false,
    }

    public setConfig(config: Partial<Config>): void {
        this.config = {
            ...this.config,
            ...config,
        }
    }

    //######### Composition #########

    protected composePrefix(level: LogLevel): string {
        switch (level) {
            case LogLevel.Verbose:
                return 'V';
            case LogLevel.Debug:
                return 'D';
            case LogLevel.Info:
                return 'I';
            case LogLevel.Warning:
                return 'W';
            case LogLevel.Error:
                return 'E';
        }
    }

    protected composeTimestamp(): string {
        const date = new Date();
        const pad = (value: number, width = 2): string => String(value).padStart(width, '0');
        return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
    }

    private composeTitle(level: LogLevel): titleData {
        const now = this.composeTimestamp();
        const bgColor = LogLevelBackgroundColors[level];
        const fgColor = LogLevelForegroundColors[level];
        return {
            titleString: `%c${this.composePrefix(level)}%c ${this.tag} %c${now}%c`,
            designStrings: [
                `font-weight: bold;color: ${fgColor};border-radius: 50%; background: ${bgColor}; padding-block: 1px; padding-inline: 5px;`,
                `font-weight: bold;color: ${bgColor};`,
                `font-weight: normal;color: ${TimestampForegroundColor}; border-radius: 4px; background: ${TimestampBackgroundColor}; padding-inline: 4px;`,
                'font-weight: normal'
            ]
        };
    }

    //######### Logging #########

    public override log(level: LogLevel, ...parcels: LogParcel[]): void {
        if (!this.canLog(level))
            return;

        let title = this.composeTitle(level);

        //Fold first parcel into the title
        if (typeof parcels[0] !== 'object')
            title.titleString += ` ${String(parcels.shift())}`

        if (!parcels.length && !this.config.trace)
            return this.log_Single(title);

        this.log_Group(title, parcels);
    }

    private log_Single(title: titleData) {
        console.log(title.titleString, ...title.designStrings);
    }

    private log_Group(title: titleData, parcels: LogParcel[]): void {
        //Print title
        if (this.config.collapsedGroups)
            console.groupCollapsed(title.titleString, ...title.designStrings);
        else
            console.group(title.titleString, ...title.designStrings);
        //Print parcels
        parcels.forEach(this.log_Parcel.bind(this));
        if (this.config.trace)
            console.trace();
        console.groupEnd();
    }

    private log_Parcel(parcel: LogParcel): void {
        switch (typeof parcel) {
            case 'bigint':
            case 'boolean':
            case 'number':
            case 'string':
            case 'undefined':
            case 'symbol':
            case 'function':
                return console.log(parcel);
            case 'object':
                if (Array.isArray(parcel)) { //Print array
                    if (this.config.tableObjectArrays && parcel.every(item => isPlainObject(item)))
                        return console.table(parcel);
                    return console.log(parcel);
                }
                if (this.config.foldObject && isPlainObject(parcel))
                    return console.dir(parcel);
                return console.log(parcel);
        }
    }
}
