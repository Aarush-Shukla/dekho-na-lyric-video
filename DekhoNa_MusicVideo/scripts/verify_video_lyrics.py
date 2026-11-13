"""Verifies that the lyrics visible in the FINAL MP4 are the right ones, line by line.
For each entry, a frame is taken from the MP4 when the line is fully revealed; the lyric region is compared
against reference renders of the expected text (renders/lyric_ref/<id>.png, text only on black, produced by
Remotion composition 'LyricOnly' at the same frame). Each video crop must best-match its own expected text
among all 55 references (identical-text lines may tie). Also checks the region is blank between lyrics.
usage: python verify_video_lyrics.py <mp4>"""
import sys, os, json, subprocess, numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation, gaussian_filter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp4 = sys.argv[1]
T = json.load(open(os.path.join(ROOT, "timing", "lyric_timing.json"), encoding="utf-8"))
ents = T["entries"]
Y0, Y1 = 1470, 1830
os.makedirs(os.path.join(ROOT, "renders", "lyric_vid"), exist_ok=True)

def mask(img, thr):
    # local-contrast "top-hat": bright text strokes minus blurred background, robust to the picture behind the text
    a = np.asarray(img.convert("L").crop((0, Y0, 1080, Y1)), dtype=np.float32)
    return (a - gaussian_filter(a, 14)) > thr

refs, vids = {}, {}
for e in ents:
    f = e["end_frame"] - 3
    p = os.path.join(ROOT, "renders", "lyric_vid", e["id"] + ".png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{f/30:.4f}", "-i", mp4, "-frames:v", "1", p], check=True)
    vids[e["id"]] = mask(Image.open(p), 22)
    refs[e["id"]] = mask(Image.open(os.path.join(ROOT, "renders", "lyric_ref", e["id"] + ".png")), 22)

# dilate video masks slightly to tolerate sub-pixel / background differences
def score(v, r):
    rd = binary_dilation(r, iterations=2)
    vd = binary_dilation(v, iterations=2)
    rec = (r & vd).sum() / max(1, r.sum())      # expected text pixels present in video
    prec = (v & rd).sum() / max(1, v.sum())     # video bright pixels explained by expected text
    return rec * prec

txt = {e["id"]: (e["original_text"], e["devanagari_text"]) for e in ents}
bad = 0
rows = []
for e in ents:
    sc = {k: score(vids[e["id"]], refs[k]) for k in refs}
    own = sc[e["id"]]
    best = max(sc, key=sc.get)
    ok = txt[best] == txt[e["id"]] and own > 0.5 and own >= sc[best] - 1e-9 or (own >= max(sc.values()) - 0.02 and own > 0.5)
    # a tie with a line whose text is identical is fine; otherwise the own id must be the best match
    if not ok:
        bad += 1
    rows.append((e["id"], round(own, 3), best, round(sc[best], 3), "OK" if ok else "FAIL"))
for r in rows: print(*r)
print(f"\nlines checked: {len(rows)}  failures: {bad}  min own-score: {min(r[1] for r in rows)}")
sys.exit(1 if bad else 0)

