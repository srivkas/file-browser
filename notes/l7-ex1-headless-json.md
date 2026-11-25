# Level 7, exercise 1: a headless answer a script can act on

## The script

`node scripts/audit-json.mjs [maxTurns]` runs the Level 6 audit (`scripts/audit.mjs`) with the same rails, plus `--json-schema`. The schema asks for `{ findings: [{ file, line, rule, why }] }`, with `rule` one of `no-network`, `no-browser-storage`, `no-react`.

| Exit | Meaning |
| --- | --- |
| 0 | The run finished and `findings` is empty |
| 1 | The run finished with findings; each is printed as `file:line  rule  why` |
| 2 | The run did not finish (a cap was hit, an error, or a tool outside the read-only list) |

The script reads only `structured_output.findings`. It never looks at Claude's text.

## Scope: only the rules src/lib keeps today

The exercise wants exit 0 on a clean tree, but `src/lib` still breaks rules that `scripts/audit.mjs` found in Level 6: `new Image()` in `image.ts`, `window.showDirectoryPicker` in `directory.ts`, display text in `formatExif` in `image.ts`, and `extension()` computing in `format.ts`. Fixing those means moving browser code and its tests, which is a design decision of its own. So this audit checks only the three rules `src/lib` keeps: no network calls, no browser storage, no React. The other violations are still open and are not fixed here.

## The envelope

Read once without a filter before writing the script. `--output-format json` prints an array of messages. The last has `type: "result"`:

- Success: `subtype: "success"`. The validated object is in **`structured_output`**. `result` holds the same thing as a JSON string, so don't parse it.
- Capped: `subtype: "error_max_turns"`, `is_error: true`, `terminal_reason: "max_turns"`, `errors: ["Reached maximum number of turns (1)"]`. Neither `result` nor `structured_output` is present.

`--json-schema` adds a tool named `StructuredOutput` to the run's `init` tool list; the model returns the object through it. The read-only check from Level 6 failed on it (`NOT READ-ONLY: the run had StructuredOutput`), so the script now allows that one name, and only it.

No Stop hook is wired in `.claude/settings.json`, so the final message is the audit's own.

## The three runs

| Run | Output | Exit | Cost |
| --- | --- | --- | --- |
| Clean tree | `CLEAN: no findings.` | 0 | $0.045 |
| `fetch` planted in `src/lib/directory.ts` | `src/lib/directory.ts:39  no-network  reportUsage() calls fetch(...)`, the exact line | 1 | $0.088 |
| Plant still in, `maxTurns` 1 | `CUT SHORT: the audit did not finish (Reached maximum number of turns (1))` | 2 | $0.007 |

The owner then ran it by hand with a second plant, `localStorage.getItem('x')` at `src/lib/text.ts:77`:

| Run | Output | Exit | Cost |
| --- | --- | --- | --- |
| Clean tree | `CLEAN: no findings.` | 0 | $0.072 |
| `localStorage` plant | `src/lib/text.ts:77  no-browser-storage  …`, as predicted before the run | 1 | $0.069 |
| Plant still in, `maxTurns` 1 | `CUT SHORT … (Reached maximum number of turns (1))` | 2 | $0.049 |

The same audit on the same tree cost $0.045 once and $0.072 the next time: the agent chooses how much to read. A run capped at one turn still cost up to 5 cents.

The third run is the point of exit code 2: the plant was still there, so a script that took "no findings" from a capped run would have called a broken tree clean.

The plant had to go in with the Edit tool. Writing it into `src/` through the shell was blocked by `.claude/hooks/guard-bash.mjs`. The plant was removed after the runs.
