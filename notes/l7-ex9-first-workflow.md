# Level 7, exercise 9: your first workflow, read before you approve

## The question

The same for every component: does it hold user-visible text written in the component instead of coming from `src/lib/format.ts`, as `CLAUDE.md` requires? Nine `.tsx` files in `src/components`, test files skipped.

The owner typed the request, with "use a workflow" and "show me the full script before running", in this session. A fresh session had no `Workflow` tool and no `workflow-authoring` skill, and offered nine plain `Agent` calls instead: no script to read, nothing to save. The cause wasn't found; no `workflow` setting exists in the settings files.

## Read before approving

The owner answered from the script, before the approval dialog:

- Agents: 9, one per file (`args.files.map`).
- Phases: 1, `Check`.
- Model: `haiku`.
- What stops an agent from editing? Nothing: "change nothing" was only in the prompt. The owner's change, applied before the run: `agentType: 'rule-reviewer'`, the Level 5 read-only agent (Read, Grep, Glob).

## The run

9 agents, 0 errors, 110.6k tokens, 9.8 seconds. Every agent used only `Read` and `StructuredOutput`: the read-only agent type held. They finished in their own order, `FolderPicker` first and `DetailPane` last.

Per agent: `DetailPane.tsx` 14, `FileTree.tsx` 4, `FolderPicker.tsx` 1, the other six 0.

The final result, as returned (paths shortened here):

| Where | Text |
| --- | --- |
| `DetailPane.tsx:18` | Size |
| `DetailPane.tsx:20` | Type |
| `DetailPane.tsx:22` | Modified |
| `DetailPane.tsx:41` | `(` and `)` |
| `DetailPane.tsx:66` | Lines |
| `DetailPane.tsx:68` | Words |
| `DetailPane.tsx:95` | Loading image… |
| `DetailPane.tsx:101` | Dimensions |
| `DetailPane.tsx:102` | ` × `, ` px`, Unknown |
| `DetailPane.tsx:104` | EXIF |
| `DetailPane.tsx:115` | No EXIF data. |
| `FileTree.tsx:154` | `▾`, `▸` |
| `FileTree.tsx:157` | `📁`, `📄` |
| `FolderPicker.tsx:35` | Choose folder |

The labels and messages are real violations. The punctuation and the tree icons are noise. `Words` is the row the exercise 5 goal built: it copied `Lines`, and no test or lint checks the rule, so the goal's condition couldn't catch it. These violations are reported, not fixed.

## What's wrong in the script

- **`missing` listed all 9 files** next to `checked: 9`. The agents returned absolute paths in `file`, and the script compared them with the relative paths it sent. The script should use the file it sent, not the one the agent names: ask the model only for what needs judgment.
- **The owner's pick, one thing to change: the result must be visible without a summary.** The workflow's return value reaches only the main session, as a notification; the owner saw what Claude relayed and nothing else, until opening the output file in `/private/tmp`. `/workflows` shows progress, not what each agent returned. A script can't write files (no file system access), so the fix is a complete, readable return value, copied into the repo as it is.
- A display command hid the path bug once: a `jq` that kept the last three path segments made the absolute paths look relative.
