import { LogLevel, type LogParcel } from './types';

export abstract class Logger {
    private static readonly levelOrder: readonly LogLevel[] = [
        LogLevel.Verbose,
        LogLevel.Debug,
        LogLevel.Info,
        LogLevel.Warning,
        LogLevel.Error,
    ];

    protected readonly tag: string;

    constructor(tag?: string) {
        this.tag = tag ?? this.constructor['name'];
        this._enabled = true;
        this._logLevel = LogLevel.Info;
    }

    //######### Enabling #########

    private _enabled: boolean;

    public setEnabled(enabled: boolean): void {
        this._enabled = enabled;
    }

    //######### Log Level #########

    private _logLevel: LogLevel;

    public setMinimumLogLevel(logLevel: LogLevel): void {
        this._logLevel = logLevel;
    }

    //######### Functionality #########

    protected canLog(level: LogLevel): boolean {
        return this._enabled
            && (Logger.levelOrder.indexOf(level) >= Logger.levelOrder.indexOf(this._logLevel));
    }

    protected getParcels(): LogParcel[] {
        return [];
    }

    public abstract log(level: LogLevel, parcels: LogParcel[]): void;

    public logVerbose(parcels: LogParcel[]): void {
        this.log(LogLevel.Verbose, parcels);
    }

    public logDebug(parcels: LogParcel[]): void {
        this.log(LogLevel.Debug, parcels);
    }

    public logInfo(parcels: LogParcel[]): void {
        this.log(LogLevel.Info, parcels);
    }

    public logWarning(parcels: LogParcel[]): void {
        this.log(LogLevel.Warning, parcels);
    }

    public logError(parcels: LogParcel[]): void {
        this.log(LogLevel.Error, parcels);
    }
}
