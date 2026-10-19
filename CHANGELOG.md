# Changelog

## 0.3.0 — 2026-10-19

- Rename the package to `dsh-ui-opacity` (from `dsh-menu-opacity`) and make it the first public release.
- Add the **session header** opacity control: 0% keeps the theme's transparent floating header, raising it adds a resting fill, and hover never drops below the theme's 45% glass.
- Fix the header selector for DSH 0.2.1-rc.2: the live header is `[class*="_header"]:has([class*="_crumbs"])`, not the older `_headerLeading` / `_headerActions` anchors.
- Popup menu opacity defaults to 96% and covers every `[data-menu-material]` surface.
- Both settings persist in localStorage and apply live.

## 0.2.0

- Add the session header opacity control (0.2.0 selector set).

## 0.1.0

- Initial release: popup menu opacity slider under Settings → Interface opacity.
