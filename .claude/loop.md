Read-only status watch for this repo. Print exactly one line, then stop.

Check two things:
- Uncommitted changes: `git status --short`. None means `clean`; otherwise the number of files listed.
- Commits not pushed: `git rev-list --count @{u}..HEAD`.

The line, always in this format:

tree: <clean|N files changed> · remaining_commit_to_push: <x> · <nothing changed|changed>

The last field compares with the line you printed on the previous tick in this conversation. On the first tick it is `changed`.

Never change, create or delete a file. Never commit, push, fetch or fix anything — only report.
