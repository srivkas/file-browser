# Level 4 · Exercise 3 — Install BMAD, and what it costs

Installed with `npx bmad-method install` (interactive), committed in `1c7946c`.

## What the install put in the repo

`_bmad/_config/manifest.yaml`: BMAD **6.12.4**, modules **`core`** and **`bmm`**, IDE **`claude-code`** only.
Answered *No* to custom/community modules (a Git URL or local path would pull in code nobody here has read).

| Path | What it is |
|---|---|
| `.claude/skills/bmad-*` | 29 skills — agents (`bmad-agent-*`), phase workflows, `bmad-build`, reviews |
| `_bmad/_config/` | manifest, file and skill manifests, help index |
| `_bmad/core/`, `_bmad/bmm/` | per-module `config.yaml` and help |
| `_bmad/scripts/` | Python helpers, run through `uv run` |
| `_bmad/config.toml` | team install answers — installer-managed |
| `_bmad/config.user.toml` | personal install answers (name, language) — installer-managed, **gitignored** here |
| `_bmad/custom/` | overrides: `config.toml` (team, committed), `config.user.toml` (personal, gitignored) |
| `_bmad/render/` | runtime output, fully gitignored |

`CLAUDE.md` and the existing code were not touched. `_bmad-output/` appears only once a workflow writes an artifact.

## What survives a re-install

- **Survives untouched:** `_bmad/custom/` — the header of every config file says the installer never touches it, so overrides belong there.
- **Doesn't survive:** `_bmad/config.toml` and `_bmad/config.user.toml` — regenerated on every install; direct edits are lost.

## What it costs every session

From `/skills` in the CLI, sorted by tokens (`t`):

- 29 `bmad-*` skills ≈ **2,520 tokens** per session, before typing anything.
- Most expensive: `bmad-deep-recon` ~250, `bmad-review` ~180, `bmad-build` ~160.
- Cheapest: the `bmad-agent-*` skills and `bmad-prd` ~40–60, `bmad-build-auto` ~30.
- Full skill bodies (~1.5 MB on disk) load only when a skill is invoked.

For comparison, the 13 `claude.ai sync` skills from the account cost ~300 tokens each for the large ones (`docs`, `pptx`, …).
`write-prompt` shows as `locked by author · user-only` because of `disable-model-invocation: true`.

Note: `/skills` in the desktop app opens the account's skills settings instead — the per-skill token counts are only in the CLI.
