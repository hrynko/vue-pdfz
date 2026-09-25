# Theming

The default theme is a quiet, neutral-gray chrome with a single swappable accent. The accent defaults to near-black "ink" in light mode and inverts to near-white "paper" in dark mode. The focus ring is a dedicated token (never the accent) so it stays legible on any re-skin.

## Theme modes

Set the mode with the `theme` prop (or the plugin's `theme` option) – `light` (the default), `dark`, or `auto`. `auto` follows `prefers-color-scheme` and reacts to system changes live; the accent inverts automatically between light and dark.

```vue
<PdfViewer theme="auto" />
```

## Tokens

Override any `--vue-pdfz-*` custom property. A rule on `.vue-pdfz-viewer` re-skins light mode; the dark palette lives on more specific selectors, so target those to re-skin dark mode as well:

```css
/* Light mode */
.vue-pdfz-viewer {
  --vue-pdfz-color-primary: #2f6bff;
  --vue-pdfz-color-primary-hover: #1f54da;
  --vue-pdfz-color-primary-contrast: #fff;
}

/* Dark mode, and `auto` on a dark system */
.vue-pdfz-viewer[data-theme='dark'] {
  --vue-pdfz-color-primary: #7aa2ff;
}
@media (prefers-color-scheme: dark) {
  .vue-pdfz-viewer[data-theme='auto'] {
    --vue-pdfz-color-primary: #7aa2ff;
  }
}
```

Or inline through the `themeTokens` prop (a partial token object). Inline tokens win in every mode, so they suit values that should not change between light and dark:

```vue
<PdfViewer
  :theme-tokens="{
    colorPrimary: '#2f6bff',
    colorPrimaryHover: '#1f54da',
    colorPrimaryContrast: '#fff',
  }"
/>
```

### Token reference

| Group    | Tokens                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces | `colorBg`, `colorSurface`, `colorSurfaceActive`, `colorHover`, `colorSidebarBg`, `colorToolbarBg`, `colorPage`, `colorBackdrop` |
| Borders  | `colorBorder`, `colorBorderStrong`                                                                                              |
| Text     | `colorText`, `colorTextSecondary`, `colorTextMuted`, `colorToolbarText`                                                         |
| Accent   | `colorPrimary`, `colorPrimaryHover`, `colorPrimaryContrast`                                                                     |
| States   | `colorHighlight`, `colorHighlightActive`, `colorFocusRing`, `colorDanger`                                                       |
| Metrics  | `toolbarHeight`, `sidebarWidth`, `controlSize`, `iconSize`, `radius`, `spacing`, `pageGap`                                      |
| Type     | `fontFamily`, `fontSize`                                                                                                        |
| Shadows  | `shadow`, `shadowElevated`, `shadowPopover`, `shadowPage`                                                                       |
| Motion   | `transition`, `duration`, `durationSlow`, `ease`                                                                                |
