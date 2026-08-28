declare const hexColorBrand: unique symbol;
export type HexColorString = string & { readonly [hexColorBrand]: true };

declare const rgbColorBrand: unique symbol;
export type RGBColorString = string & { readonly [rgbColorBrand]: true };

declare const rgbaColorBrand: unique symbol;
export type RGBAColorString = string & { readonly [rgbaColorBrand]: true };

declare const HSLColorBrand: unique symbol;
export type HSLColorString = string & { readonly [HSLColorBrand]: true };

export type ColorString =
    | HexColorString
    | RGBColorString
    | RGBAColorString
    | HSLColorString