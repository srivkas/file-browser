# Level 6, exercise 6: no "done" on red

## The hook

`.claude/hooks/stop-check.mjs` runs when Claude tries to end its turn. It runs `npm run check`, and while the check is red it answers `{"decision": "block", "reason": …}`, so Claude goes back to work with the failure. The reason says that a red check is part of the task even when Claude's own change didn't cause it, which settles the conflict found in exercise 2.

It never traps the session:

- **Two blocks, then it lets go.** `stop_hook_active` tells it a stop is a retry after its own block. It counts blocks in `logs/stop-check.json`, and after the second one in a row it lets the turn end, so Claude stops and reports. A stop that doesn't follow a block starts the count again. The owner chose two; Claude Code's own limit of 8 blocks is never reached.
- **Time.** The hook has `"timeout": 10` in `.claude/settings.json`, the owner's limit, and stops the check after 9 seconds so it can still answer. A check that runs out of time lets the turn end.
- **Any error in the hook** lets the turn end.

It skips the check when nothing changed since the last green run. It compares a hash of `HEAD`, `git diff HEAD` and the untracked files, so a turn with no code change costs nothing.

## The check had to stay fast

The check took about 4 seconds. The first version of these tests, in `hooks.test.ts`, made it 6 seconds, because each one starts npm and the tests in one file run one after another. They moved to `.claude/hooks/stop-check.test.ts`, which runs in parallel with the others, and the check is back to about 4 seconds.

## The run

On 2026-11-10 the hook was wired in and the exercise 2 plant was repeated: `compareNodes` in `src/lib/tree.ts` listed files first. Claude tried to end its turn on the red check, and the hook refused, with the failing tests in the reason. Claude fixed `compareNodes` from those messages, the check went green, and the turn ended. In exercise 2, with no hook, a subagent stopped and asked instead.

## Not wired in

The owner found a full check at the end of every turn too much, so after the run the hook was removed from `.claude/settings.json`. The script and its tests stay in the repo, and wiring it back is one `Stop` entry. `CONTRACT.md` marks the rule as advisory.
