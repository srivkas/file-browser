# Level 7, exercise 11: the right tool, with its price

The table is in `CLAUDE.md`, under "Picking a tool for unattended work". Every number in it is from a run in this repo:

| Tool | Run | Measured |
| --- | --- | --- |
| `claude -p` | `scripts/audit-json.mjs`, exercise 1 | $0.045, $0.088, $0.072, $0.069 per run |
| `/goal` | Exercises 3 and 5 | 1 turn, 1.9k tokens, 42 s; 1 turn, 4.2k tokens, 61 s |
| `/goal`, vague | Exercise 4, "beautiful and readable" | $0.71 for the session, 9 checks, no achieved verdict |
| `/loop` | Exercise 6, `/loop 1m`, from the session's usage | Tick 1: 113k cached + 0.9k new input, 162 out. Tick 2: 115k + 0.4k, 159 out. Tick 3 (two rounds): 290k + 0.8k, 347 out |
| Workflow | Exercise 9 | 9 agents, 110.6k tokens, 9.8 s |

The loop's cost is almost all the conversation, resent on every tick: two git commands and a 160-token line rode on 115k tokens of history.

## The same task, with a lighter tool

Exercise 9's workflow asked one question of 9 small files. Redone by the owner as one headless run, same question, same model (`haiku`), read-only, capped:

```
claude -p "For each .tsx file in src/components/ (not tests), list user-visible text written directly in the component instead of coming from src/lib/format.ts: JSX text, title, alt, aria-label, placeholder. Ignore class names, keys and punctuation. Change nothing." --tools Read,Grep,Glob --strict-mcp-config --max-turns 15 --max-budget-usd 1 --model haiku --output-format json
```

| | Workflow | Headless |
| --- | --- | --- |
| Tokens | 110.6k over 9 agents | 56.9k in 12 turns: 33.2k cache read, 20.0k cache write, 3.7k output (summed from the run's transcript). The run reported $0.006 |
| Time | 9.8 s | 17 s |
| Findings | The 12 strings, plus `(`, `)` and the tree icons as noise | The same 12 strings |
| Judgment | One file per agent | Saw that the tree icons are `aria-hidden`, and that `alt={file.name}` is data, not text |

Compare tokens with tokens: the workflow reports only tokens, and a dollar figure for cheap cached `haiku` tokens made the headless run look far smaller than it was. It used about half. It isn't known whether the workflow's 110.6k counts cache reads the same way, so the ratio is approximate.

For 9 files, one agent that sees all of them used about half the tokens and judged better. The workflow's only gain was 7 seconds from running in parallel. It pays off with many units, or units that each need a deep read.
