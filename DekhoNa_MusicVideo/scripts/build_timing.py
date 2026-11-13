"""Builds timing/lyric_timing.{json,csv} and project/src/data/{lyric_timing,scene_timing}.json
from (a) manual line anchors derived from ASR + pitch/structure analysis, (b) detected vocal onsets.
Single dataset -> both JSON and CSV."""
import json, csv, os, re, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
DUR = 241.348209
orig = json.load(open(os.path.join(ROOT, "project/src/data/lyrics_original.json"), encoding="utf-8"))
deva = json.load(open(os.path.join(ROOT, "project/src/data/lyrics_devanagari.json"), encoding="utf-8"))["lines"]
onsets = json.load(open(os.path.join(ROOT, "timing/vocal_onsets.json")))["vocal_onsets"]
ana = json.load(open(os.path.join(ROOT, "timing/audio_analysis.json")))

# id: (estimated vocal start, vocal end, method, animation)
A = "asr_anchor+onset_snap"
P = "pitch_structure_inferred"
E = {
 "V1_L1": (24.10, 27.00, A, "fade-rise"), "V1_L2": (27.36, 29.90, A, "word-reveal"), "V1_L3": (30.00, 32.70, A, "fade-rise"), "V1_L4": (32.84, 35.20, A, "scale-in"),
 "V2_L1": (35.42, 38.70, A, "mask-reveal"), "V2_L2": (39.04, 40.90, A, "fade-rise"), "V2_L3": (41.20, 43.80, A, "word-reveal"), "V2_L4": (44.04, 46.40, A, "fade-rise"),
 "PC1_L1": (46.74, 49.50, A, "fade-rise"), "PC1_L2": (49.84, 51.80, A, "word-reveal"), "PC1_L3": (52.02, 54.60, A, "fade-rise"), "PC1_L4": (54.75, 57.00, A, "fade-rise"),
 "PC1_L5": (57.20, 59.70, A, "word-reveal"), "PC1_L6": (59.90, 63.20, A, "scale-in"),
 "C1_L1": (65.70, 68.90, A, "fade-rise"), "C1_L2": (69.14, 71.90, A, "word-reveal"), "C1_L3": (72.14, 74.70, A, "fade-rise"), "C1_L4": (74.90, 77.30, A, "fade-rise"), "C1_L5": (78.40, 80.60, A, "scale-in"),
 "PO_L1": (81.80, 84.10, P, "word-reveal"), "PO_L2": (84.40, 86.70, P, "word-reveal"), "PO_L3": (87.00, 89.00, P, "word-reveal"),
 "V3_L1": (102.90, 112.30, P, "mask-reveal"), "V3_L2": (112.70, 123.20, A, "mask-reveal"), "V3_L3": (124.50, 134.70, A, "mask-reveal"), "V3_L4": (135.00, 147.20, A, "mask-reveal"),
 "V4_L1": (151.70, 154.70, A, "fade-rise"), "V4_L2": (155.14, 157.90, A, "fade-rise"), "V4_L3": (158.14, 160.90, A, "word-reveal"), "V4_L4": (161.04, 163.50, A, "fade-rise"),
 "V4_L5": (163.76, 166.20, A, "fade-rise"), "V4_L6": (166.40, 169.30, A, "scale-in"),
 "V5_L1": (171.70, 174.90, A, "fade-rise"), "V5_L2": (175.18, 177.70, A, "fade-rise"), "V5_L3": (177.88, 180.40, A, "word-reveal"), "V5_L4": (180.64, 182.70, A, "fade-rise"),
 "V5_L5": (182.88, 186.00, A, "fade-rise"), "V5_L6": (186.26, 188.90, A, "mask-reveal"), "V5_L7": (189.08, 191.60, A, "fade-rise"), "V5_L8": (191.82, 194.00, A, "scale-in"),
 "PC2_L1": (194.12, 197.40, A, "fade-rise"), "PC2_L2": (197.66, 200.10, A, "word-reveal"), "PC2_L3": (200.40, 203.00, A, "fade-rise"), "PC2_L4": (203.02, 205.90, A, "fade-rise"),
 "PC2_L5": (206.10, 208.60, A, "word-reveal"), "PC2_L6": (208.82, 211.00, A, "scale-in"),
 "FC_L1": (211.06, 213.90, A, "fade-rise"), "FC_L2": (214.22, 216.90, A, "word-reveal"), "FC_L3": (217.18, 219.70, A, "fade-rise"), "FC_L4": (219.92, 222.20, A, "scale-in"),
 "FC_L5": (222.40, 225.40, A, "mask-reveal"), "FC_L6": (225.68, 227.90, A, "fade-rise"), "FC_L7": (228.12, 230.60, A, "word-reveal"), "FC_L8": (230.94, 232.80, A, "fade-rise"),
 "FC_L9": (233.25, 235.90, P, "scale-in"),
}
# strong onsets only
st = sorted(o["strength"] for o in onsets)
thr = st[int(len(st) * 0.55)]
strong = [o for o in onsets if o["strength"] >= thr]

def snap(t, lo=0.2, hi=0.2):
    c = [o for o in strong if t - lo <= o["t"] <= t + hi]
    if not c:
        return t, False
    best = max(c, key=lambda o: o["strength"] - 0.04 * abs(o["t"] - t))
    return best["t"], True

def syl(w):
    w = re.sub(r"[^A-Za-z]", "", w).lower()
    return max(1, len(re.findall(r"[aeiou]+", w)))

beats = ana["beats"]
def near_beat(t):
    b = min(beats, key=lambda x: abs(x - t))
    return round(b, 3), round(abs(b - t) * 1000)

lines = []
for sec in orig["sections"]:
    for ln in sec["lines"]:
        lines.append((sec, ln))
entries = []
for sec, ln in lines:
    s_est, e_est, method, anim = E[ln["id"]]
    s, snapped = snap(s_est)
    s = round(s, 3)
    entries.append({"sec": sec, "ln": ln, "s": s, "e": e_est, "snapped": snapped, "method": method, "anim": anim, "s_est": s_est})
# monotonic + end sanity
for i, en in enumerate(entries):
    nxt = entries[i + 1]["s"] if i + 1 < len(entries) else DUR
    en["e"] = round(min(en["e"], nxt - 0.05), 3)
    if en["e"] <= en["s"] + 0.3:
        en["e"] = round(en["s"] + 0.8, 3)

out_entries = []
for i, en in enumerate(entries):
    sec, ln = en["sec"], en["ln"]
    words = ln["text"].split()
    wt = [syl(w) for w in words]
    tot = sum(wt)
    dur = en["e"] - en["s"]
    # sustained vowels/ellipses: reserve the tail (last word gets the sustain) -> weight last word more if line has ellipsis
    if "…" in ln["text"] or "(" in words[-1]:
        wt[-1] += 1
        tot += 1
    t = en["s"]
    wts = []
    for w, k in zip(words, wt):
        d = dur * k / tot
        wts.append({"word": w, "start_seconds": round(t, 3), "end_seconds": round(t + d, 3)})
        t += d
    nxt_start = entries[i + 1]["s"] if i + 1 < len(entries) else DUR
    disp_start = max(0.0, en["s"] - 0.10)
    prev_disp_end = out_entries[-1]["display_end_seconds"] if out_entries else 0.0
    disp_start = max(disp_start, prev_disp_end + 0.02)
    # hold ~0.45 s after the vocal ends, but always clear before the next line's display starts
    disp_end = min(en["e"] + 0.45, nxt_start - 0.12)
    disp_end = max(disp_end, disp_start + 0.4)
    nb, nbd = near_beat(en["s"])
    out_entries.append({
        "id": ln["id"], "section": sec["name"], "section_id": sec["id"],
        "original_text": ln["text"], "devanagari_text": deva[ln["id"]],
        "vocal_onset_seconds": en["s"], "vocal_end_seconds": en["e"],
        "display_start_seconds": round(disp_start, 3), "display_end_seconds": round(disp_end, 3),
        "start_seconds": round(disp_start, 3), "end_seconds": round(disp_end, 3),
        "start_frame": round(disp_start * FPS), "end_frame": round(disp_end * FPS),
        "vocal_onset_frame": round(en["s"] * FPS),
        "word_timings": wts, "word_timing_source": "syllable-weighted estimate within measured line span",
        "scene_id": "scene_" + ln["id"], "animation": en["anim"],
        "nearest_beat_seconds": nb, "onset_to_beat_ms": nbd,
        "onset_snapped_to_detected_vocal_onset": en["snapped"], "asr_estimate_seconds": en["s_est"],
        "sync_confidence": ("asr+onset-snapped (est. +/-0.2s)" if (en["method"].startswith("asr") and en["snapped"]) else "asr-only (est. +/-0.3s)" if en["method"].startswith("asr") else "inferred (pitch/structure, est. +/-0.3s)"),
        "alignment_method": en["method"],
    })

# instrumental boundaries (derived from measured gaps between vocal end and next vocal onset)
sections_inst = [
    {"name": "Intro (instrumental)", "start_seconds": 0.0, "end_seconds": out_entries[0]["display_start_seconds"], "note": "no vocal detected before ~23.6 s (ASR on 12-25 s returned nothing)"},
    {"name": "Instrumental gap before Chorus 1", "start_seconds": entries[13]["e"], "end_seconds": entries[14]["s"]},
    {"name": "Hook (instrumental break)", "start_seconds": entries[21]["e"], "end_seconds": entries[22]["s"], "note": "sparse notes only; quiet lull ~101-103 s then band re-entry"},
    {"name": "Instrumental interlude before Verse 4", "start_seconds": entries[25]["e"], "end_seconds": entries[26]["s"]},
    {"name": "Outro (silence / fade)", "start_seconds": entries[-1]["e"], "end_seconds": DUR, "note": "audio decays to digital silence by ~237 s"},
]
for s in sections_inst:
    s["start_frame"] = round(s["start_seconds"] * FPS); s["end_frame"] = round(s["end_seconds"] * FPS)

total_frames = math.ceil(DUR * FPS)
dataset = {
    "song": "Dekho Na", "artist": "Saksham", "audio_file": "Dekho Na(KoshalWorld.Com).mp3 (copied to assets/audio/original_song.mp3, untouched)",
    "fps": FPS, "resolution": "1080x1920", "duration_seconds": round(DUR, 3), "duration_frames": total_frames,
    "tempo_bpm": round(ana["tempo_bpm"] / 2, 2), "tempo_note": "librosa beat tracker with start_bpm=86 -> 86.13 BPM (0.6966 s/beat)",
    "timing_method": "ASR (faster-whisper small, Hindi) used as rough anchors; each line start snapped to the nearest strong vocal-band onset (+/-0.35 s); sustained notes/pickups cross-checked with pyin pitch tracking; structure checked against 86 BPM bar grid. NOT verified by human listening.",
    "instrumental_sections": sections_inst,
    "entries": out_entries,
}
json.dump(dataset, open(os.path.join(ROOT, "timing/lyric_timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump(dataset, open(os.path.join(ROOT, "project/src/data/lyric_timing.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
with open(os.path.join(ROOT, "timing/lyric_timing.csv"), "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["id", "section", "original_text", "devanagari_text", "vocal_onset_s", "vocal_end_s", "display_start_s", "display_end_s", "start_frame", "end_frame", "animation", "scene_id", "nearest_beat_s", "onset_to_beat_ms", "onset_snapped", "sync_confidence"])
    for e in out_entries:
        w.writerow([e["id"], e["section"], e["original_text"], e["devanagari_text"], e["vocal_onset_seconds"], e["vocal_end_seconds"], e["display_start_seconds"], e["display_end_seconds"], e["start_frame"], e["end_frame"], e["animation"], e["scene_id"], e["nearest_beat_seconds"], e["onset_to_beat_ms"], e["onset_snapped_to_detected_vocal_onset"], e["sync_confidence"]])
    for s in sections_inst:
        w.writerow(["INSTRUMENTAL", s["name"], "", "", "", "", s["start_seconds"], s["end_seconds"], s["start_frame"], s["end_frame"], "", "", "", "", "", ""])

# ---- scene timeline (visual beats) ----
G = lambda i: out_entries[i]
byid = {e["id"]: e for e in out_entries}
scene_marks = []  # (start_seconds, scene_id)
scene_marks += [(0.0, "intro_a"), (7.0, "intro_b"), (14.0, "intro_c")]
for e in out_entries:
    if e["id"] == "PO_L1":
        pass
    scene_marks.append((e["display_start_seconds"], e["scene_id"]))
# hook
hk0 = entries[21]["e"] + 0.2
hk1 = entries[22]["s"] - 0.3
span = hk1 - hk0
scene_marks += [(hk0, "hook_a"), (hk0 + span / 3, "hook_b"), (hk0 + 2 * span / 3, "hook_c")]
scene_marks += [(entries[-1]["e"] + 0.4, "outro")]
scene_marks.sort()
scenes = []
for i, (t, sid) in enumerate(scene_marks):
    t_end = scene_marks[i + 1][0] if i + 1 < len(scene_marks) else DUR
    scenes.append({"scene_id": sid, "start_seconds": round(t, 3), "end_seconds": round(t_end, 3),
                   "start_frame": round(t * FPS) if i else 0, "end_frame": round(t_end * FPS) if i + 1 < len(scene_marks) else total_frames})
json.dump({"fps": FPS, "duration_frames": total_frames, "scenes": scenes}, open(os.path.join(ROOT, "project/src/data/scene_timing.json"), "w"), indent=2)
print("entries", len(out_entries), "scenes", len(scenes), "frames", total_frames)
print("snapped:", sum(1 for e in out_entries if e["onset_snapped_to_detected_vocal_onset"]), "of", len(out_entries))
for e in out_entries:
    d = e["vocal_onset_seconds"] - e["asr_estimate_seconds"]
    print(f'{e["id"]:7s} est {e["asr_estimate_seconds"]:7.2f} onset {e["vocal_onset_seconds"]:7.2f} ({d:+.2f}) end {e["vocal_end_seconds"]:7.2f} disp {e["display_start_seconds"]:7.2f}-{e["display_end_seconds"]:7.2f} f{e["start_frame"]}-{e["end_frame"]} {e["sync_confidence"]}')
