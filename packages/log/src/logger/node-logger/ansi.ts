import type { ColorString } from '@pixel-forge/utils/color';

const RESET = '\x1b[0m';

function parseHex(color: ColorString): { r: number; g: number; b: number } {
    const match = /^#([0-9A-Fa-f]{6})$/.exec(color);
    if (!match)
        throw new Error(`expected #RRGGBB, got ${color}`);
    const n = match[1];
    if (!n)
        throw new Error(`expected #RRGGBB, got ${color}`);
    return {
        r: parseInt(n.slice(0, 2), 16),
        g: parseInt(n.slice(2, 4), 16),
        b: parseInt(n.slice(4, 6), 16),
    };
}

/**
 * One SGR sequence, reset first, foreground last.
 * Cursor/xterm.js drops 24-bit fg when it follows a lone `\x1b[1m` (bold).
 */
export function paint(
    text: string,
    style: { fg: ColorString; bg?: ColorString; bold?: boolean },
): string {
    const params = ['0'];
    if (style.bold)
        params.push('1');
    if (style.bg) {
        const { r, g, b } = parseHex(style.bg);
        params.push(`48;2;${r};${g};${b}`);
    }
    const { r, g, b } = parseHex(style.fg);
    params.push(`38;2;${r};${g};${b}`);
    return `\x1b[${params.join(';')}m${text}${RESET}`;
}
