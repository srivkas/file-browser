# The 7 techniques — use each only when it fits

| Technique | When | How it shows in the prompt |
|---|---|---|
| **Be specific** | Always | Replace vague words ("nice", "fast", "handle errors") with something checkable: a file name, a number, an exact message. |
| **Brief once** | Always | Everything Claude needs is in this one prompt — context, rules, done, scope, report — so it never has to ask back. |
| **Role** | Always, one line | "You're a developer on …" — no long persona. |
| **Multishot (examples)** | An exact format or behaviour matters | 1–3 concrete examples, e.g. `"3 min ago"`, `"READ" matches "readme.md"`. |
| **XML tags** | The user pastes material: a log, data, a spec, existing text | Wrap it: `<error_log>…</error_log>`, `<spec>…</spec>`, and refer to it by tag name. |
| **Data first** | The pasted material is long | Put the tagged material **before** the task and question. |
| **Dial effort** | Always — but not in the prompt text | Recommend `--effort` next to the prompt: `low` for small, clear changes; `medium` for a contained feature; `high` for design work, many files, or tricky bugs. |

For every technique you skip, note one line why (e.g. "XML / data first — nothing pasted").
