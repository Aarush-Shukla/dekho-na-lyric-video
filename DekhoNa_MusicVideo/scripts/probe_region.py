import sys, os, json, numpy as np, librosa
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s, e = float(sys.argv[1]), float(sys.argv[2])
y, sr = librosa.load(os.path.join(ROOT, "assets", "audio", "original_song.mp3"), sr=22050, mono=True, offset=s, duration=e - s)
f0, vf, vp = librosa.pyin(y, fmin=librosa.note_to_hz("C3"), fmax=librosa.note_to_hz("C6"), sr=sr, frame_length=2048, hop_length=512)
t = librosa.frames_to_time(np.arange(len(f0)), sr=sr, hop_length=512) + s
rms = librosa.feature.rms(y=y, hop_length=512)[0]
step = int(0.25 * sr / 512)
print("t     rms  voiced  note")
for i in range(0, len(t) - step, step):
    seg = slice(i, i + step)
    v = np.nanmean(vp[seg])
    fz = np.nanmedian(f0[seg]) if np.isfinite(f0[seg]).any() else np.nan
    note = librosa.hz_to_note(fz) if np.isfinite(fz) else "--"
    print(f"{t[i]:6.2f} {rms[seg].mean()*100:4.0f} {v:5.2f}  {note}")
