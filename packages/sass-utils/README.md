# @pixel-forge/sass-utils

Sass shorthands, mixins, and functions. No runtime JavaScript — this package
ships source partials that you `@use` from your own stylesheets.

Function docs live on the SCSS as SassDoc (`///` comments), the Sass equivalent
of JSDoc. A later docs site can generate pages from those comments. `/* */` is
not used — Sass would copy those into the consumer's CSS.

## Install

```bash
npm i @pixel-forge/sass-utils
```

Requires a Dart Sass compiler (`sass` or `sass-embedded`, 1.71+ for the `pkg:`
importer).

## Import surface

There is no root entry point. You `@use` the subpath you need:

```scss
@use 'pkg:@pixel-forge/sass-utils/assertion' as Assert;
@use 'pkg:@pixel-forge/sass-utils/color' as Color;
@use 'pkg:@pixel-forge/sass-utils/palette' as Palette;
```

| Subpath     | Exposes                                        |
| ----------- | ---------------------------------------------- |
| `assertion` | `assertColor`, `assertNumber`, `assertInteger` |
| `color`     | `colorWithAlpha`                               |
| `palette`   | `paletteBuilder`                               |

## License

MIT
