# Level 6, exercise 10: both reviews, before a human

`/code-review` (medium, every finding) and `/security-review` both ran on the exercise 8 breadcrumb feature, on 2026-11-11.

## The same diff for both

Commit `514b4b4` holds the breadcrumb together with hook and settings changes, and the branch holds all of Level 6. So a temporary branch was made from `558f9db`, and only the six breadcrumb files were checked out from `514b4b4` as uncommitted changes (80 lines; `git add -N` so the new files showed in `git diff`). The branch was deleted afterwards.

- `/code-review` reviews the uncommitted diff, so it saw exactly those 80 lines.
- `/security-review` builds its diff only from commits against `origin/main`. On the temporary branch that was 36 files of hooks from exercises 1–7 and none of the breadcrumb. Its method and filtering rules were run on the breadcrumb diff instead, through a subagent.

## What each found

`/code-review`: seven findings, none about security. Two on how a deep path looks, one on an empty landmark, one on the `nav` holding plain text, two small design notes, and one false alarm: the feature's prompt "missing", which was only because `prompts/l6-ex8-breadcrumb.md` wasn't copied to the temporary branch.

`/security-review`: nothing survived its filter. It tried eight attacks through folder names: HTML, `..`, backslashes, the right-to-left override U+202E, look-alike slashes, zero-width characters, newlines and duplicate keys. All were rejected: React escapes text, and the path is only displayed, never used to open anything.

They agreed there was no security problem, because they asked different questions. The code review asked whether the bar works and found display and accessibility issues. The security review asked what a hostile file name could do, and found the answer is nothing.

## Top three findings and decisions

| Finding | Decision |
| --- | --- |
| On a deep path every folder name shrinks to nothing while the separators don't, and the folder nearest the file is cut first | Not fixed. The owner judged it not worth it for this course app; the `title` tooltip shows each full name |
| A file at the root renders an empty `nav` landmark | Not fixed, same reason |
| Hostile folder names can't do harm through the breadcrumb: text only, never a file access | Nothing to fix |

Outside the diff, the security review pointed at `src/components/MarkdownView.tsx:137`, which builds an `href` from a Markdown file, the one place a `javascript:` link would matter. Reported here, not reviewed or changed.
