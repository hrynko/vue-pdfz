# Props

All props are optional except `source`. The three view-state props – `page`, `rotation`, and `zoom` – are two-way bindable and documented under [v-model bindings](#v-model-bindings) below. The types named in the table are exported from `vue-pdfz`.

<!-- @include: ./_generated/props.md -->

## v-model bindings

Three props are two-way bindable and also emit an `update:*` event:

- `v-model:page` – the current page number (`number`, default `1`).
- `v-model:rotation` – `0 | 90 | 180 | 270` (default `0`).
- `v-model:zoom` – a number or one of `'auto'` / `'page-fit'` / `'page-width'` (default `'auto'`).
