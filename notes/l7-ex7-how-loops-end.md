# Level 7, exercise 7: three ways a loop ends

Run by the owner in one session (`5313ba58`), with the watch from exercise 6 (`.claude/loop.md`). The tool calls below are from that session's transcript.

## The two kinds

| | Fixed interval | Self-paced |
| --- | --- | --- |
| Start | `/loop 1m` | `/loop` (no interval) |
| Behind it | `CronCreate {"cron": "* * * * *", "recurring": true}`: a scheduled task with an id | `ScheduleWakeup {"delaySeconds": 1200, …}`: one pending wake-up, set again each tick |
| Esc | Doesn't stop it: ticks went on at 13:12 and 13:13 | Ends the wait. The session then also called `ScheduleWakeup {"stop": true}` |
| Stop it | Ask Claude to cancel: `CronDelete` | Esc, or ask |

## What happened

1. `/loop 1m`: a tick each minute, still ticking after Esc.
2. "List the scheduled tasks": `CronList`, then "cancel it": `CronDelete 9ab5c785`, then `CronList` again: gone.
3. `/loop` with no interval: Claude picked 1200 seconds, with the reason "Quiet, clean branch with nothing to push, so I'll check back in 20 minutes." The pace follows the state: nothing moving, a long wait.
4. Self-paced started again, then `/loop 1m` on top. The new loop replaced the old one: `ScheduleWakeup {"stop": true}`, then `CronCreate`. A session runs one loop of these kinds at a time, so only the fixed one was left.
5. `/exit` asked what to do with the running task: move the session to the background and exit, stay, or stop the tasks and exit. The owner chose to stop them. After `claude --resume`: `CronList` → "No scheduled jobs". The fixed loop (`f7ec455f`) was deleted with the session: scheduled tasks live in the session, not on disk.

## Which kind came back after a resume

Neither. The self-paced one had already been replaced, and the fixed one was stopped at exit. A loop that must outlive the session needs "move to background" at exit (the session goes on living, reached with `claude attach`, not `--resume`) or a cloud scheduled task. Both kinds also expire after seven days on their own.

## What it taught

- Esc stops only the self-paced kind. A fixed loop ends when its scheduled task is deleted.
- Listing the tasks is the way to know what's still running: `CronList` before and after.
- Starting a loop replaces the one already running in the session.
- Leaving a session with "stop tasks" ends its loops. Coming back means starting them again.
