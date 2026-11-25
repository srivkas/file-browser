# Level 7, exercise 8: the loop reports, the goal fixes

**Not run.** The owner skipped the runs and kept the concept. What was prepared and discussed:

## The plan

1. The shortcut first: `/loop 1m /goal git status --short prints nothing`. A scheduled prompt is delivered as text, not typed as a command, so no goal starts. Claude gets the sentence as a request on every tick.
2. Then properly: `/loop 1m` with the exercise 6 watch, a `loop-break.tmp` created from another session, and, once a tick reports `tree: 1 files changed`, a goal written by the owner:

```
/goal git status --short prints nothing — print its output as proof. Delete only *.tmp files, no other file. If it is not clean after 3 turns, the goal has failed — say why.
```

Without "delete only *.tmp files", "the tree is clean" could also be reached with `git checkout .` or by deleting other files.

## What the owner took from it

- The loop and the goal are separate. The loop is a timer that sends `loop.md` every minute; the goal is one task that clears itself when achieved or failed. The goal is not added to each tick.
- A session does one thing at a time. While the goal works, a tick that comes due waits, and a missed tick isn't made up.
- A loop can't start a goal, by design. A loop runs while nobody watches; if it could start a fix on every tick, it would "fix" changes made on purpose. Writing the fix into `loop.md` makes the watch an unchecked fixer that repeats any mistake every minute. The loop tells you something broke, you decide, a goal fixes.
