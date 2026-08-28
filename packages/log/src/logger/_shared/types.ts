/**
 * Values acceptable as a printable log argument.
 * Recursive so nested arrays/objects of printables are allowed.
 */
export type LogParcel =
    | string
    | number
    | boolean
    | bigint
    | null
    | undefined
    | Error
    | Date
    | RegExp
    | readonly LogParcel[]
    | { readonly [key: string]: LogParcel };

export const LogLevel = {
    Verbose: 'verbose',
    Debug: 'debug',
    Info: 'info',
    Warning: 'warning',
    Error: 'error',
} as const;
export type LogLevel = typeof LogLevel[keyof typeof LogLevel];
