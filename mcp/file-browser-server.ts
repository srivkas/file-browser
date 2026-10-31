// file-browser's own MCP server: narrow, read-only questions about this repo, over stdio.
// Run with `node --experimental-strip-types mcp/file-browser-server.ts` (Node 22.6+).
// It reads files under FB_PROJECT_ROOT and never writes, runs programs or uses the network.
import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const ROOT = path.resolve(process.env.FB_PROJECT_ROOT || '.');
const SKIP = new Set(['.git', 'node_modules', 'dist', '.agents', '.codex']);
const TOKENS_FILE = 'src/styles/tokens.css';
const MAX_PROMPT_FILE_BYTES = 100 * 1024;

/** Real path of a project-relative file, or null when it (or a symlink on the way) leads outside the project. */
async function insideRoot(relative: string): Promise<string | null> {
  const [root, absolute] = await Promise.all([realpath(ROOT), realpath(path.resolve(ROOT, relative)).catch(() => null)]);
  if (!absolute) return null;
  return absolute === root || absolute.startsWith(root + path.sep) ? absolute : null;
}

async function* walk(dir: string): AsyncGenerator<{ path: string; size: number }> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(absolute);
    else if (entry.isFile()) yield { path: path.relative(ROOT, absolute), size: (await stat(absolute)).size };
  }
}

// Claude Code may defer MCP tools (only their names are listed until searched for),
// but server instructions always sit in the system prompt — so the routing goes here too.
const server = new McpServer(
  { name: 'file-browser', version: '1.0.0' },
  {
    instructions:
      'For any question about the biggest, largest or heaviest files in this repo, of any type, call largest_files instead of running ls, du, find or a search. The design tokens are the resource file-browser://design-tokens; check_rules reviews one file against the project rules.',
  },
);

server.registerTool(
  'largest_files',
  {
    title: 'Largest files in file-browser',
    description:
      'Lists the largest files in the file-browser repo with exact sizes, biggest first. Use it whenever someone asks for the biggest, largest or heaviest files (optionally of one type, like md or ts) instead of running ls, du or find. Skips .git, node_modules, dist and the Codex copies in .agents/ and .codex/.',
    inputSchema: {
      limit: z.number().int().min(1).max(50).default(10).describe('How many files to list, 1–50.'),
      extension: z
        .string()
        .regex(/^[a-z0-9]+$/i, 'An extension without the dot, like md or ts.')
        .optional()
        .describe('Only files with this extension, without the dot.'),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ limit, extension }) => {
    const files = [];
    for await (const file of walk(ROOT)) {
      if (!extension || path.extname(file.path).slice(1).toLowerCase() === extension.toLowerCase()) files.push(file);
    }
    files.sort((a, b) => b.size - a.size);
    const lines = files.slice(0, limit).map((file) => `${file.size}\t${file.path}`);
    return { content: [{ type: 'text', text: lines.length ? lines.join('\n') : 'No matching files.' }] };
  },
);

server.registerResource(
  'design-tokens',
  'file-browser://design-tokens',
  {
    title: 'Design tokens',
    description: `Every CSS variable in ${TOKENS_FILE} with its value — the only colors, sizes and spacing CSS may use.`,
    mimeType: 'text/plain',
  },
  async (uri) => {
    const css = await readFile(path.join(ROOT, TOKENS_FILE), 'utf8');
    const tokens = [...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => `${name}: ${value.trim()}`);
    return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: tokens.join('\n') }] };
  },
);

server.registerPrompt(
  'check_rules',
  {
    title: 'Check a file against the project rules',
    description: "Reviews one file of the repo against CLAUDE.md and .claude/rules/, listing each rule it breaks.",
    argsSchema: { file: z.string().min(1).describe('Path of the file, relative to the project root.') },
  },
  async ({ file }) => {
    const absolute = await insideRoot(file);
    if (!absolute) throw new Error(`${file} is not a file in the project.`);
    const info = await stat(absolute);
    if (!info.isFile()) throw new Error(`${file} is not a file.`);
    if (info.size > MAX_PROMPT_FILE_BYTES) throw new Error(`${file} is over ${MAX_PROMPT_FILE_BYTES} bytes.`);
    const text = await readFile(absolute, 'utf8');
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Check \`${file}\` against this project's rules — CLAUDE.md and every file in .claude/rules/ that applies to its path. For each rule it breaks, quote the line and name the rule. Don't change the file.\n\n\`\`\`\n${text}\n\`\`\``,
          },
        },
      ],
    };
  },
);

await server.connect(new StdioServerTransport());
