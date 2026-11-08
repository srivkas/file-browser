# Level 5, exercise 5: ship it as a plugin

## What moved

The plugin `file-browser-tools` lives in the marketplace folder `marketplace/`. It holds the `release-check` skill and the `rule-audit` command, both moved from `.claude/` so each has one source, and one hook. The command is now `/file-browser-tools:rule-audit`.

The hook runs before every `Bash` call and asks the owner to confirm a `git push` that names `main`, because a push to `main` deploys the live site. It reads the command text only, so a bare `git push` while on `main` is not caught.

## Wiring

`.claude/settings.json` declares the marketplace in `extraKnownMarketplaces` with the relative path `./marketplace`, and turns the plugin on in `enabledPlugins`.

Gotcha: `claude plugin marketplace add ./marketplace --scope project` rewrote that path as an absolute one. It was set back by hand, and the plugin still loaded in a fresh session.

## Lifecycle

Checked on 2026-11-08 in a fresh `claude -p` session after each step, by reading the session's list of commands and skills.

| Step | Command and skill |
| --- | --- |
| Before install | absent |
| Installed | present |
| Disabled | absent |
| Enabled again | present, without uninstalling |

The owner ran `/reload-plugins` and then the command from the plugin in a live session, and it expanded correctly, live context included.

## Validation

`claude plugin validate ./marketplace` passes with warnings about optional metadata only.

The hook was tested directly on its script: `git push origin HEAD:main` and `git push origin main` ask; a feature-branch push, `feat/main` and `git log main` do not.

It was also seen in a live session: `git push --dry-run origin HEAD:main` stopped and asked the owner for confirmation. The dry run changes nothing on GitHub, so the live site was not touched.
