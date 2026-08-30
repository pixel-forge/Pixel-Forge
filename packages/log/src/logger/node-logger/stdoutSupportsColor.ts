import { stdout } from 'node:process';

export function stdoutSupportsColor(): boolean {
    return typeof stdout.hasColors === 'function' && stdout.hasColors();
}
