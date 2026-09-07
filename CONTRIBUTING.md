# Contributing

Thanks for your interest in improving **vue-pdfz**! This repository is a **pnpm**-workspaces monorepo.

| Package                                        | Description                            |
| ---------------------------------------------- | -------------------------------------- |
| [`packages/docs`](./packages/docs)             | VitePress documentation site           |
| [`packages/playground`](./packages/playground) | Local demo app used for manual testing |
| [`packages/vue-pdfz`](./packages/vue-pdfz)     | The published library                  |

## Prerequisites

- **node** – the version pinned in [`.nvmrc`](./.nvmrc) (`nvm use`).
- **pnpm** – pinned via the [`packageManager`](./package.json) field (`corepack enable`).

## Getting started

Install the workspace dependencies once from the repo root; **pnpm** links the packages to each other.

```bash
pnpm install
```

| Command           | Description                |
| ----------------- | -------------------------- |
| `pnpm demo:dev`   | Run the playground app     |
| `pnpm docs:dev`   | Run the documentation site |
| `pnpm test`       | Run the unit tests         |
| `pnpm build`      | Build the library          |
| `pnpm docs:build` | Build the docs site        |

## Commit messages

This project follows the [Conventional Commits](https://conventionalcommits.org) specification. A pre-commit hook runs `lint-staged` (ESLint + Prettier) over staged files.

## Pull requests

- Branch from `develop` and open your pull request against it.
- Keep changes focused, and add or update tests where it makes sense.
- Make sure `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` all pass.

## Documentation

The documentation site lives in [`packages/docs`](./packages/docs) (VitePress). The props and events reference tables are generated from the JSDoc on the component's `defineProps` / `defineEmits` via `pnpm docs:api` – edit the JSDoc in the source, not the generated tables.

It deploys to GitHub Pages on every push to `main` that touches the docs or the library source (see [`.github/workflows/docs.yml`](./.github/workflows/docs.yml)).

## Releasing

The library is published to the **npm** registry from `packages/vue-pdfz` by CI when a `v*` tag is pushed (see [`.github/workflows/release.yml`](./.github/workflows/release.yml)).
