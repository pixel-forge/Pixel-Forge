export type LogParcel = string | number | Object;
export const LogLevel = {
    Verbose: 'verbose',
    Debug: 'debug',
    Info: 'info',
    Warning: 'warning',
    Error: 'error',
} as const;
export type LogLevel = typeof LogLevel[keyof typeof LogLevel];
