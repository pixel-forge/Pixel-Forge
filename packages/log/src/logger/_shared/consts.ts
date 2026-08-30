import { LogLevel } from "./types";
import {assertHexColor, type ColorString} from '@pixel-forge/utils/color';

export const LogLevelBackgroundColors: {[K in LogLevel]: ColorString} = {
    [LogLevel.Verbose]: assertHexColor('#800080'),
    [LogLevel.Debug]: assertHexColor('#007ACC'),
    [LogLevel.Info]: assertHexColor('#008000'),
    [LogLevel.Warning]: assertHexColor('#B45309'),
    [LogLevel.Error]: assertHexColor('#B91C1C'),
}

export const LogLevelForegroundColors: {[K in LogLevel]: ColorString} = {
    [LogLevel.Verbose]: assertHexColor('#FFFFFF'),
    [LogLevel.Debug]: assertHexColor('#FFFFFF'),
    [LogLevel.Info]: assertHexColor('#FFFFFF'),
    [LogLevel.Warning]: assertHexColor('#FFFFFF'),
    [LogLevel.Error]: assertHexColor('#FFFFFF'),
}

export const TimestampForegroundColor: ColorString = assertHexColor('#FFFFFF');
export const TimestampBackgroundColor: ColorString = assertHexColor('#2C3F50');
export const ProcessIdentityForegroundColor: ColorString = assertHexColor('#FFFFFF');
export const ProcessIdentityBackgroundColor: ColorString = assertHexColor('#6B3A5A');
