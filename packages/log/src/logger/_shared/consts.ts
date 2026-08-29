import { LogLevel } from "./types";
import {assertHexColor, type ColorString} from '@pixel-forge/utils/color';

export const LogLevelPrefix: {[key in LogLevel]: string} = {
    [LogLevel.Verbose]: 'V',
    [LogLevel.Debug]: 'D',
    [LogLevel.Info]: 'I',
    [LogLevel.Warning]: 'W',
    [LogLevel.Error]: 'E',
}

export const LogLevelBackgroundColors: {[K in LogLevel]: ColorString} = {
    [LogLevel.Verbose]: assertHexColor('#800080'),
    [LogLevel.Debug]: assertHexColor('#007ACC'),
    [LogLevel.Info]: assertHexColor('#008000'),
    [LogLevel.Warning]: assertHexColor('#FFA500'),
    [LogLevel.Error]: assertHexColor('#EF4444'),
}

export const LogLevelForegroundColors: {[K in LogLevel]: ColorString} = {
    [LogLevel.Verbose]: assertHexColor('#FFFFFF'),
    [LogLevel.Debug]: assertHexColor('#000000'),
    [LogLevel.Info]: assertHexColor('#FFFFFF'),
    [LogLevel.Warning]: assertHexColor('#000000'),
    [LogLevel.Error]: assertHexColor('#000000'),
}
