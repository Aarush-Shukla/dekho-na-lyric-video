"""Re-run ASR on a time region with permissive thresholds. usage: asr_region.py start end [prompt]"""
import sys, types, os, numpy as np
for n in ("av", "onnxruntime"):
    sys.modules.setdefault(n, types.ModuleType(n))
from faster_whisper import WhisperModel
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = np.fromfile(os.path.join(ROOT, "timing", "_analysis_16k.raw"), dtype=np.float32)
s, e = float(sys.argv[1]), float(sys.argv[2])
prompt = sys.argv[3] if len(sys.argv) > 3 else None
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a[int(s * 16000):int(e * 16000)], language="hi", word_timestamps=True, vad_filter=False,
                       condition_on_previous_text=False, beam_size=5, initial_prompt=prompt,
                       no_speech_threshold=1.0, log_prob_threshold=-5.0, compression_ratio_threshold=10.0, temperature=0.0)
for sg in segs:
    print(f"SEG {sg.start+s:.2f}-{sg.end+s:.2f} {sg.text}")
    print("   " + " | ".join(f"{w.word.strip()} {w.start+s:.2f}" for w in (sg.words or [])))
