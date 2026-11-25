# Level 7, exercise 6: a status line on a timer

## The watch

`.claude/loop.md`, from the owner's spec: two things to watch, one line, no changes.

- Uncommitted changes: `git status --short`.
- Commits not pushed: `git rev-list --count @{u}..HEAD`.
- The line: `tree: <clean|N files changed> · remaining_commit_to_push: <x> · <nothing changed|changed>`.

"Nothing changed" is the line's last field, not a replacement for it, so every tick has the same format. The loop doesn't `fetch`: that writes inside `.git` and goes to the network.

Started in a fresh session with `/loop 1m` and no prompt, so it ran `loop.md`.

## The ticks

| Tick | Line |
| --- | --- |
| 1 | `tree: 1 files changed · remaining_commit_to_push: 0 · changed` (the uncommitted `loop.md`; the first tick is always `changed`) |
| 2 | `tree: 1 files changed · remaining_commit_to_push: 0 · nothing changed` |
| (from another session: `loop-break.tmp` created in the repo root) | |
| 3 | `tree: 2 files changed · remaining_commit_to_push: 0 · changed` |

The audit log for the loop session shows `CronCreate` once, then `git status --short; git rev-list --count @{u}..HEAD` once a minute, and at the end `CronDelete` when the owner asked it to cancel the loop. No Edit or Write. `git status` afterwards listed only `loop.md`. The temporary file was removed by hand.

## The interval

1 minute, the minimum, for the exercise: three ticks in about three minutes. These two things change only while someone works in the repo, so in real use 10 to 15 minutes would be enough, and every tick is a full turn even when nothing changed.

## Asides

- Only `.claude/loop.md` is the default. More watches go in their own files or, better, as project commands run with `/loop <interval> /<command>`.
- A timed loop is a scheduled task (`CronCreate`), and cancelling it deletes the task (`CronDelete`). Esc doesn't stop it.
