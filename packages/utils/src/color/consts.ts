import type { HexColorString, HSLColorString, RGBAColorString, RGBColorString } from "./types";

export function isHexColor(value: string): value is HexColorString {
    const regex = new RegExp(/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i);
    return regex.test(value);
}

export function isRGBColor(value: string): value is RGBColorString {
    const regex = new RegExp("^rgb\\(\\s*(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\s*,\\s*(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\s*,\\s*(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\s*\\)$");
    return regex.test(value);
}

export function isRGBAColor(value: string): value is RGBAColorString {
    const regex = new RegExp("^rgba\\(\\s*(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\s*,\\s*(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\s*,\\s*(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\s*,\\s*(0|1|0?\\.\\d+)\\s*\\)$");
    return regex.test(value);
}

export function isHSLColor(value: string): value is HSLColorString {
    const regex = new RegExp("^hsl\\(\\s*(360|3[0-5]\\d|[12]?\\d?\\d)\\s*,\\s*(100|[1-9]?\\d)%\\s*,\\s*(100|[1-9]?\\d)%\\s*\\)$");
    return regex.test(value);
}

export function assertHexColor(value: string): HexColorString {
    if (!isHexColor(value))
        throw new Error(`Invalid HEX color received: ${value}`);
    return value;
}

export function assertRGBColor(value: string): RGBColorString {
    if (!isRGBColor(value))
        throw new Error(`Invalid RGB color received: ${value}`);
    return value;
}

export function assertRGBAColor(value: string): RGBAColorString {
    if (!isRGBAColor(value))
        throw new Error(`Invalid RGBA color received: ${value}`);
    return value;
}

export function assertHSLColor(value: string): HSLColorString {
    if (!isHSLColor(value))
        throw new Error(`Invalid HSL color received: ${value}`);
    return value;
}