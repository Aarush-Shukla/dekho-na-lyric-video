// Validates that every lyric shown on screen == the authoritative Romanized original, in order.
// Usage: node validate_lyrics.mjs [dataDir]   (exit code 1 on any failure)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.argv[2] ?? path.join(here, "..", "project", "src", "data");
const srcDir = path.join(dataDir, "..");
const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
const errors = [];
const fail = (m) => errors.push(m);

const orig = read("lyrics_original.json");
const deva = read("lyrics_devanagari.json");
const timing = read("lyric_timing.json");
const scenes = read("scene_timing.json");

// 1. flatten original
const flat = orig.sections.flatMap((s) => s.lines.map((l) => ({ ...l, section: s.name })));

// 2. hash lock (independent of the working file)
const lockPath = path.join(here, "lyrics_original.lock.json");
const canonical = flat.map((l) => `${l.id}\t${l.text}`).join("\n");
const sha = crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  if (lock.sha256 !== sha) fail(`lyrics_original.json differs from locked original (expected ${lock.sha256.slice(0, 12)}…, got ${sha.slice(0, 12)}…)`);
  if (lock.lines.length !== flat.length) fail(`line count ${flat.length} != locked ${lock.lines.length}`);
  lock.lines.forEach((t, i) => { if (flat[i] && flat[i].text !== t) fail(`line ${i + 1} (${flat[i].id}) changed: "${flat[i].text}" != locked "${t}"`); });
} else fail("lyrics_original.lock.json missing");

// 3. timing entries == original (exact string, same order, none omitted)
if (timing.entries.length !== flat.length) fail(`timing has ${timing.entries.length} entries, original has ${flat.length}`);
flat.forEach((l, i) => {
  const e = timing.entries[i];
  if (!e) return;
  if (e.id !== l.id) fail(`order mismatch at ${i + 1}: timing ${e.id} vs original ${l.id}`);
  if (e.original_text !== l.text) fail(`${l.id}: on-screen text "${e.original_text}" != original "${l.text}"`);
  if (e.devanagari_text !== deva.lines[l.id]) fail(`${l.id}: devanagari in timing differs from lyrics_devanagari.json`);
  if (e.word_timings.map((w) => w.word).join(" ") !== l.text) fail(`${l.id}: word_timings do not reassemble the original text`);
});

// 4. devanagari mapping completeness + script purity
for (const l of flat) {
  const d = deva.lines[l.id];
  if (!d) { fail(`${l.id}: missing Devanagari`); continue; }
  if (/[A-Za-z]/.test(d)) fail(`${l.id}: Devanagari text contains Latin letters: ${d}`);
  if (!/[ऀ-ॿ]/.test(d)) fail(`${l.id}: no Devanagari characters`);
  if (/ा{2}|ि{2}|ं{2}/.test(d)) fail(`${l.id}: doubled matra/sign`);
  if (d.split(" ").length !== l.text.split(" ").length) console.warn(`note: ${l.id} word count differs (deva ${d.split(" ").length} vs rom ${l.text.split(" ").length})`);
}
for (const k of Object.keys(deva.lines)) if (!flat.find((l) => l.id === k)) fail(`extra Devanagari key ${k}`);

// 5. timing sanity
let prevEnd = -1;
for (const e of timing.entries) {
  if (!(e.end_frame > e.start_frame)) fail(`${e.id}: end_frame <= start_frame`);
  if (e.start_frame < prevEnd) fail(`${e.id}: overlaps previous line (${e.start_frame} < ${prevEnd})`);
  if (e.vocal_onset_seconds < e.display_start_seconds - 1e-6 || e.vocal_onset_seconds > e.display_end_seconds) fail(`${e.id}: vocal onset outside display window`);
  if (e.end_frame > timing.duration_frames) fail(`${e.id}: beyond video end`);
  prevEnd = e.end_frame;
}
// 6. scenes cover the whole video contiguously
let cur = 0;
for (const s of scenes.scenes) {
  if (s.start_frame !== cur) fail(`scene ${s.scene_id}: gap/overlap at frame ${cur} (starts ${s.start_frame})`);
  cur = s.end_frame;
}
if (cur !== scenes.duration_frames) fail(`scenes end at ${cur}, expected ${scenes.duration_frames}`);

// 7. no hard-coded lyrics in source code
const needles = flat.map((l) => l.text).filter((t) => t.length > 12);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((f) => (f.isDirectory() ? (f.name === "data" ? [] : walk(path.join(d, f.name))) : [path.join(d, f.name)]));
for (const f of walk(srcDir).filter((f) => /\.(tsx?|css)$/.test(f))) {
  const txt = fs.readFileSync(f, "utf8");
  for (const n of needles) if (txt.includes(n)) fail(`hard-coded lyric in ${path.relative(srcDir, f)}: "${n}"`);
  for (const d of Object.values(deva.lines)) if (d.length > 8 && txt.includes(d)) fail(`hard-coded Devanagari lyric in ${path.relative(srcDir, f)}`);
}

if (errors.length) {
  console.error(`LYRIC VALIDATION FAILED (${errors.length} problem${errors.length > 1 ? "s" : ""}):`);
  errors.forEach((e) => console.error(" - " + e));
  process.exit(1);
}
console.log(`LYRIC VALIDATION PASSED: ${flat.length} lines, order intact, exact Romanized text, sha256 ${sha.slice(0, 16)}…`);
