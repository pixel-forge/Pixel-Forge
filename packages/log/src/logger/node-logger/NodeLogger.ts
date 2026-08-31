import { hostname } from 'node:os';
import { pid } from 'node:process';
import { inspect, type InspectOptions } from 'node:util';
import { isMainThread, threadId } from 'node:worker_threads';
import { isPlainObject } from '@pixel-forge/utils/object';
import {
    LogLevelBackgroundColors,
    LogLevelForegroundColors,
    ProcessIdentityBackgroundColor,
    ProcessIdentityForegroundColor,
    TimestampBackgroundColor,
    TimestampForegroundColor,
} from '../_shared/consts';
import { Logger } from '../_shared/Logger';
import { LogLevel, type LogParcel } from '../_shared/types';
import { paint } from './ansi';
import { inspectDepth, inspectMaxArrayLength, inspectMaxStringLength } from './consts';
import { stdoutSupportsColor } from './stdoutSupportsColor';
import type { Config } from './types';

export class NodeLogger
    extends Logger {

    constructor(tag?: string) {
        super(tag);
    }

    //######### Configuration #########

    private config: Config = {
        foldObject: true,
        tableObjectArrays: false,
        trace: false,
        processIdentity: false,
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
                return ' | VERBOSE';
            case LogLevel.Debug:
                return ' | DEBUG  ';
            case LogLevel.Info:
                return ' | INFO   ';
            case LogLevel.Warning:
                return ' | WARNING';
            case LogLevel.Error:
                return ' | ERROR  ';
        }
    }

    protected composeTimestamp(): string {
        return new Date().toISOString();
    }

    private composeProcessIdentity(): string {
        const identity = `${pid}@${hostname()}`;
        if (isMainThread)
            return identity;
        return `${identity} t${threadId}`;
    }

    private composeTitle(level: LogLevel): string {
        const bgColor = LogLevelBackgroundColors[level];
        const fgColor = LogLevelForegroundColors[level];
        const prefix = this.composePrefix(level);
        const tag = ` · ${this.tag} `;
        const time = ` ${this.composeTimestamp()} `;
        const identity = this.config.processIdentity
            ? ` ${this.composeProcessIdentity()} `
            : '';

        if (!stdoutSupportsColor())
            return `${prefix}${tag}${time}${identity}`;

        return [
            paint(prefix, { fg: fgColor, bg: bgColor, bold: true }),
            paint(tag, { fg: fgColor, bg: bgColor, bold: true }),
            paint(time, { fg: TimestampForegroundColor, bg: TimestampBackgroundColor }),
            paint(' ', { fg: fgColor, bg: bgColor }),
            identity ? paint(identity, { fg: ProcessIdentityForegroundColor, bg: ProcessIdentityBackgroundColor }) : '',
        ].join('');
    }

    private inspectOptions(): InspectOptions {
        return {
            depth: inspectDepth,
            maxStringLength: inspectMaxStringLength,
            maxArrayLength: inspectMaxArrayLength,
            colors: stdoutSupportsColor(),
        };
    }

    //######### Logging #########

    public override log(level: LogLevel, ...parcels: LogParcel[]): void {
        if (!this.canLog(level))
            return;

        let title = this.composeTitle(level);

        //Fold first parcel into the title
        if (typeof parcels[0] !== 'object') {
            const content = ` ${String(parcels.shift())}`
            title += !stdoutSupportsColor()
                ? content
                : paint(content, { fg: LogLevelBackgroundColors[level] });
        }

        if (!parcels.length && !this.config.trace)
            return this.log_Single(title);

        this.log_Group(title, parcels);
    }

    private log_Single(title: string) {
        console.log(title);
    }

    private log_Group(title: string, parcels: LogParcel[]): void {
        //Print title
        console.group(title);
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
                if (Array.isArray(parcel)) {
                    if (this.config.tableObjectArrays && parcel.every(item => isPlainObject(item)))
                        return console.table(parcel);
                    return this.logInspected(parcel);
                }
                if (this.config.foldObject && isPlainObject(parcel))
                    return console.dir(parcel, this.inspectOptions());
                if (isPlainObject(parcel))
                    return this.logInspected(parcel);
                return console.log(parcel);
        }
    }

    private logInspected(value: object): void {
        console.log(inspect(value, this.inspectOptions()));
    }
}
