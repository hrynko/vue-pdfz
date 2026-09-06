# Keyboard shortcuts

The viewer is fully keyboard-operable out of the box. The table below lists the default bindings – every action is configurable, and the whole system can be disabled.

| Action                | Default                                       |
| --------------------- | --------------------------------------------- |
| Next / previous page  | `→` `PageDown` / `←` `PageUp`                 |
| First / last page     | `Home` / `End`                                |
| Rotate CW / CCW       | `r` / `Shift+R`                               |
| Next / previous match | `Ctrl/⌘ G` `F3` / `Ctrl/⌘ Shift+G` `Shift+F3` |
| Toggle thumbnails     | `F4`                                          |
| Zoom in / out         | `Ctrl/⌘ +` / `Ctrl/⌘ -`                       |
| Reset zoom            | `Ctrl/⌘ 0`                                    |
| Toggle search         | `Ctrl/⌘ F`                                    |
| Close overlay         | `Esc`                                         |
| Print / download      | `Ctrl/⌘ P` / `Ctrl/⌘ S`                       |

## Override or disable

Pass the [`shortcuts`](/api/props) prop to rebind an action (`mod` = `Ctrl` on Windows/Linux, `⌘` on macOS), or an empty array to remove a binding:

```vue
<PdfViewer
  :shortcuts="{
    toggleSearch: ['mod+k'],
    print: [],
  }"
/>
```

Disable keyboard handling entirely:

```vue
<PdfViewer :enable-keyboard="false" />
```

Shortcuts are ignored while focus is in a form field, except `Esc`, the search toggle, and next / previous match.
