# Level 5, exercise 7: file viewer, click a file and see it

## What it does

Every file in the tree can be pressed. The selected file is marked with `●`, and the pane shows its path, size and content, highlighted for its language with line numbers. The tree and the preview sit in two columns, and a pane narrower than 70 columns stacks them.

## Limits

- Files over 256 KB get one line saying why, well below the 4 MiB that `$.fs.read` refuses.
- A readable file shows at most its first 400 lines and 60,000 characters, with a line saying it was cut.
- A file with control characters or invalid UTF-8 counts as binary and gets one line, because the drawing accepts only tab and newline as control characters.
- A file that cannot be read gets one line.

## Staying inside the project

A selected path is refused if it contains `..`, `.git` or `node_modules`, or if its real path does not start with the project's real path plus a separator. The separator keeps a sibling such as `/project-other` out.

## Project changes this needed

The engine writes `mods/*/.claude-plugin/types` and `mods/*/tsconfig.json` when it loads a mod. Both are ignored by git, and ESLint now skips the types folder, which otherwise failed `npm run check` with 66 errors in generated code.

## Checked

- `claude plugin validate ./mods/file-viewer` passes, and the module type-checks.
- `claude plugin test ./mods/file-viewer`: 7 tests pass, including a binary, a huge and an unreadable file, and paths outside the project.
- The owner loaded the pane on 2026-11-09 and confirmed that it works as expected. An unreadable file and a path outside the project cannot be reached by pressing rows, so those two are covered by tests only.
