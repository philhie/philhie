# TODOS

Deferred, non-blocking:

- `--signal` is now an alias of `--ink`. Retire the token and the `hover:text-signal` uses that are
  therefore no-ops.
- `.label-mono` is a sans face despite the name. Rename it to `.label`.
- `.thoughts-back` carries `view-transition-name: masthead-title`, but the `/thoughts` `<h1>` does
  not. The shared-element morph targets the wrong node.
- `--text-display` in `app/globals.css` is unused.
- `middleware.ts` declares `ROOT_DOMAIN` and never reads it (eslint warning). Next 16 also wants the
  file renamed to `proxy.ts`.
