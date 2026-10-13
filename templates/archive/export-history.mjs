// Readable archive of every chat about one project: your messages and the assistant's replies,
// with timestamps, every multiple-choice question (options + the answer you gave), tool calls and
// system noise left out, secrets masked. One Markdown file per session under OUT.
//
// Why: the transcripts are the only record of how decisions were made. Assemble's archive
// (9 sessions, about 2.3 MB) fed this whole guide. Refresh it after every batch; keep OUT
// outside every git repo. Grep the output for unmasked key shapes before sharing it.
//
// Usage: node export-history.mjs
//   1. set ROOT to your Claude Code projects folder
//   2. list every session in SESSIONS: [name, "<project-folder>/<session-id>.jsonl"]
//      (find them with: ls ~/.claude/projects/*/ | grep jsonl; the folder name is the working
//      directory with separators replaced by dashes; worktree sessions have their own folders)
//   3. add new sessions to SESSIONS as they appear — nothing else changes
import { createReadStream, mkdirSync, writeFileSync, statSync } from "node:fs";
import { createInterface } from "node:readline";
import { join, basename } from "node:path";

const ROOT = "[C:/Users/<you>/.claude/projects]";
const OUT = "[ABSOLUTE PATH]/Project History/chats";
mkdirSync(OUT, { recursive: true });

const SESSIONS = [
  ["wireframes", "[D--Path-To-Wireframes-Folder]/[session-id].jsonl"],
  ["ui-and-backend-1", "[D--Path-To-UI-Folder]/[session-id].jsonl"],
  ["side-task-[name]", "[D--Path-To-UI-Folder--claude-worktrees-[name]]/[session-id].jsonl"],
];

// Mask every key shape your providers use (same list as tools/security/scan-secrets.mjs) plus
// generic "password/secret/token = …" assignments and database URLs.
const mask = (s) => s
  .replace(/ghp_[A-Za-z0-9]{20,}/g, "ghp_****")
  .replace(/github_pat_[A-Za-z0-9_]{20,}/g, "github_pat_****")
  .replace(/vcp_[A-Za-z0-9]{20,}/g, "vcp_****")
  .replace(/AIza[0-9A-Za-z_-]{20,}/g, "AIza****")
  .replace(/AQ\.[A-Za-z0-9_-]{20,}/g, "AQ.****")
  .replace(/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/g, "sk_****")
  .replace(/sk-[A-Za-z0-9_-]{20,}/g, "sk-****")
  .replace(/re_[A-Za-z0-9]{20,}/g, "re_****")
  .replace(/tsk_[A-Za-z0-9]{20,}/g, "tsk_****")
  .replace(/AKIA[0-9A-Z]{16}/g, "AKIA****")
  .replace(/postgres(?:ql)?:\/\/[^\s"'`]+/g, "postgres://****")
  .replace(/(password|secret|token|api[_-]?key)(\s*[:=]\s*)["']?[^\s"'`]{12,}/gi, "$1$2****");

const clean = (t) => mask(t
  .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
  .replace(/<task-notification>[\s\S]*?<\/task-notification>/g, "")
  .replace(/<local-command-caveat>[\s\S]*?<\/local-command-caveat>/g, "")
  .replace(/<command-(name|message|args)>[\s\S]*?<\/command-\1>/g, "")
  .replace(/<local-command-stdout>[\s\S]*?<\/local-command-stdout>/g, "")
  .replace(/\[SYSTEM NOTIFICATION[\s\S]*?(?=\n\n|$)/g, "")
).trim();

const summary = [];
for (const [name, rel] of SESSIONS) {
  const file = join(ROOT, rel);
  let size;
  try { size = statSync(file).size; } catch { console.log("missing", rel); continue; }
  const rl = createInterface({ input: createReadStream(file, { encoding: "utf8" }), crlfDelay: Infinity });
  const parts = [];
  let first = null, last = null, users = 0, replies = 0;
  for await (const line of rl) {
    if (!line.trim()) continue;
    let j; try { j = JSON.parse(line); } catch { continue; }
    if (j.isSidechain || j.isMeta) continue; // sub-agent chatter and meta rows are not the conversation
    const ts = j.timestamp ? j.timestamp.replace("T", " ").slice(0, 16) : "";
    if (j.type === "user" && j.message) {
      const c = j.message.content;
      let text = typeof c === "string" ? c : Array.isArray(c) ? c.filter((b) => b.type === "text").map((b) => b.text).join("\n") : "";
      // answers given through the multiple-choice question tool arrive as tool results
      if (Array.isArray(c)) {
        for (const b of c) {
          if (b.type === "tool_result") {
            const r = typeof b.content === "string" ? b.content : Array.isArray(b.content) ? b.content.map((x) => x.text || "").join("\n") : "";
            const m = r.match(/(?:User has answered your questions|Your questions have been answered|The user answered): ([\s\S]*?)(?:\. You can now continue|\. Read the answers carefully|$)/);
            if (m) text += `\n[Answer] ${m[1]}`;
          }
        }
      }
      text = clean(text);
      if (!text) continue;
      users++; first ??= ts; last = ts;
      parts.push(`### You · ${ts}\n\n${text}\n`);
    } else if (j.type === "assistant" && j.message && Array.isArray(j.message.content)) {
      let text = j.message.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
      // questions asked through the multiple-choice tool, with their options
      for (const b of j.message.content) {
        if (b.type === "tool_use" && b.name === "AskUserQuestion" && b.input?.questions) {
          for (const q of b.input.questions) {
            text += `\n\n**Question:** ${q.question}\n` + (q.options || []).map((o) => `- ${o.label}: ${o.description}`).join("\n");
          }
        }
      }
      text = clean(text);
      if (!text) continue;
      replies++; first ??= ts; last = ts;
      parts.push(`### Assistant · ${ts}\n\n${text}\n`);
    }
  }
  const header = `# [App] chat archive — ${name}\n\nSource: ${basename(rel)} (${(size / 1048576).toFixed(1)} MB raw)\nPeriod: ${first} → ${last} (UTC)\nYour messages: ${users} · Replies and questions: ${replies}\nTool calls, tool output and system notices are left out; keys, tokens and database URLs are masked.\n\n---\n\n`;
  const out = join(OUT, `${(first || "").slice(0, 10)}-${name}.md`);
  writeFileSync(out, header + parts.join("\n"));
  const kb = Math.round(Buffer.byteLength(header + parts.join("\n")) / 1024);
  summary.push(`${(first || "").slice(0, 10)}  ${name.padEnd(32)} ${String(users).padStart(4)} msgs  ${String(replies).padStart(5)} replies  ${kb} KB`);
}
console.log(summary.join("\n"));
console.log("\nCheck before sharing: grep -E 'ghp_[A-Za-z0-9]{20}|vcp_[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{20}|postgres://[^*]' <OUT>/*.md  → expect no output");
