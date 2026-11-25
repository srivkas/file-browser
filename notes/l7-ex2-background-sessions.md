# Level 7, exercise 2: start it, leave it, stop it

Run by the owner in a separate terminal, Claude Code 2.1.332.

## The commands

| Command | What it does |
| --- | --- |
| `claude --bg "<task>"` | Starts a session in the background, prints its id, returns at once |
| `claude agents` | Opens agent view: an interactive screen with the sessions and their output |
| `claude agents --json [--all]` | The same list as JSON, for scripts. `--all` adds finished sessions |
| `claude logs <id>` | Prints the session's recent output without entering it |
| `claude attach <id>` | Enters the session. `←` returns to agent view, `Ctrl+Z` to the shell; it keeps running |
| `claude stop <id>` | Stops it. The conversation is kept |
| `claude rm <id>` | Removes it from the list (and its worktree). Also a different command from `stop` |

A background session is not a headless run: `--bg` is interactive work without a window, `-p` is one answer printed to stdout.

## What happened

1. `claude --bg` with a read-only task: summarise every component in `src/components`. The terminal was closed.
2. In a new terminal, `claude agents` did not print a list: it opened agent view, with the session and its answer. `claude agents --json` printed the list.
3. The list holds interactive sessions too. Only background sessions have an `id`; the interactive ones show `id: null`.
4. A second session ("summarise every file in src/") was stopped with `claude stop` within seconds.
5. `claude attach` on the stopped session opened its conversation: the prompt, and no output yet.

## `status` and `state`

`--json --all` for the two background sessions:

| | `f4a77426` (finished) | `1b70c863` (stopped) | `1b70c863` after `attach` |
| --- | --- | --- | --- |
| `state` | `done` | `stopped` | `working` |
| `status` | `idle` | missing | `idle` |
| `pid` | present | missing | a new one |

`status` is what a live session is doing now (`busy`, `idle`). `state` is where it stands in its life (`working`, `done`, `stopped`). A stopped session has no process.

`attach` on a stopped session starts it again, under a new process. `stop` is not final: anyone who attaches revives it.

## How I learn that a run has finished

Today, only by looking: `state` in `claude agents --json`, or `claude logs`. Nothing tells me by itself. The next step is a notification: a `Stop` hook that runs `osascript` for a macOS notification (local), or one that posts to a messaging service, which sends the message out of the machine, so its content needs a decision first. That is the stretch goal "Called back".
