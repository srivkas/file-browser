#!/usr/bin/env node
// Status line: the model, the session's live cost and how long it has run.
// Claude Code pipes the session as JSON on stdin and shows the first line printed.
import { readFileSync, writeSync } from 'node:fs';

let session = {};
try {
  session = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  // Show what we can rather than nothing.
}

const model = session.model?.display_name ?? 'Claude';
const cost = session.cost?.total_cost_usd ?? 0;
const minutes = Math.round((session.cost?.total_duration_ms ?? 0) / 60000);

writeSync(1, `${model} · $${cost.toFixed(2)} · ${minutes} min\n`);
