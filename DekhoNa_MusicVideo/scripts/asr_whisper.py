"""ASR aid: runs faster-whisper on the original song to get rough vocal phrase/word timings.
Output is an *aid* only; timings are reviewed/corrected against signal analysis."""
import sys, types, json, subprocess, os
import numpy as np

# stub optional modules unavailable on Python 3.15 (we feed numpy arrays, so av/onnx are unused)
for name in ("av", "onnxruntime"):
    if name not in sys.modules:
        sys.modules[name] = types.ModuleType(name)

from faster_whisper import WhisperModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, "assets", "audio", "original_song.mp3")
tmp = os.path.join(ROOT, "timing", "_analysis_16k.raw")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "f32le", tmp], check=True)
audio = np.fromfile(tmp, dtype=np.float32)
PROMPT = " ".join(json.load(open(os.path.join(ROOT,"project","src","data","lyrics_devanagari.json"),encoding="utf-8"))["lines"].values()) if len(sys.argv)>2 else None
size = sys.argv[1] if len(sys.argv) > 1 else "small"
model = WhisperModel(size, device="cpu", compute_type="int8")
segs, info = model.transcribe(audio, language="hi", word_timestamps=True, vad_filter=False,
                              condition_on_previous_text=False, beam_size=5, initial_prompt=PROMPT)
out = []
for s in segs:
    out.append({"start": s.start, "end": s.end, "text": s.text,
                "words": [{"w": w.word, "s": w.start, "e": w.end, "p": w.probability} for w in (s.words or [])]})
    print(f"{s.start:7.2f} {s.end:7.2f} {s.text}", flush=True)
json.dump(out, open(os.path.join(ROOT, "timing", f"_asr_{size}{"_prompt" if PROMPT else ""}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

