# Theming

The default theme is a quiet, neutral-gray chrome with a single swappable accent. The accent defaults to near-black "ink" in light mode and inverts to near-white "paper" in dark mode. The focus ring is a dedicated token (never the accent) so it stays legible on any re-skin.

## Theme modes

Set the mode with the `theme` prop – `light`, `dark`, or `auto`. `auto` follows `prefers-color-scheme` and reacts to system changes live; the accent inverts automatically between light and dark.

```vue
<PdfViewer theme="auto" />
```

## Tokens

Override any `--vue-pdfz-*` custom property:

```css
/* Re-skin to a blue accent – coexists with light/dark mode */
.vue-pdfz-viewer {
  --vue-pdfz-color-primary: #2f6bff;
  --vue-pdfz-color-primary-hover: #1f54da;
  --vue-pdfz-color-primary-contrast: #fff;
}
```

Or inline through the `themeTokens` prop (a partial token object):

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

| Group     | Tokens                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces  | `colorBg`, `colorSurface`, `colorSurfaceActive`, `colorHover`, `colorSidebarBg`, `colorToolbarBg`, `colorPage`, `colorBackdrop` |
| Borders   | `colorBorder`, `colorBorderStrong`                                                                                              |
| Text      | `colorText`, `colorTextSecondary`, `colorTextMuted`, `colorToolbarText`                                                         |
| Accent    | `colorPrimary`, `colorPrimaryHover`, `colorPrimaryContrast`                                                                     |
| Highlight | `colorHighlight`, `colorHighlightActive`, `colorFocusRing`, `colorDanger`                                                       |
| Metrics   | `toolbarHeight`, `sidebarWidth`, `controlSize`, `iconSize`, `radius`, `spacing`, `pageGap`                                      |
| Type      | `fontFamily`, `fontSize`                                                                                                        |
| Shadows   | `shadow`, `shadowElevated`, `shadowPopover`, `shadowPage`                                                                       |
| Motion    | `transition`, `duration`, `durationSlow`, `ease`                                                                                |

These are the keys of the `ThemeTokens` interface (the `themeTokens` prop's type), exported from `vue-pdfz`.
