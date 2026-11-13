"""Signal analysis: duration, RMS, tempo/beats, onsets, vocal-activity proxy, phrase segmentation.
Writes timing/audio_analysis.json"""
import os, json, numpy as np, librosa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, "assets", "audio", "original_song.mp3")
y, sr = librosa.load(src, sr=22050, mono=True)
dur = len(y) / sr
hop = 512
rms = librosa.feature.rms(y=y, hop_length=hop)[0]
t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)

# harmonic/percussive split; vocal-band proxy = harmonic energy in 200-3500 Hz relative to total
H, P = librosa.decompose.hpss(librosa.stft(y, hop_length=hop))
S = np.abs(H)
freqs = librosa.fft_frequencies(sr=sr)
band = (freqs > 250) & (freqs < 3400)
vocal_proxy = S[band].sum(0) / (S.sum(0) + 1e-9) * rms

tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=hop)
tempo = float(np.atleast_1d(tempo)[0])
beat_t = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
onsets = librosa.frames_to_time(librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr, hop_length=hop, backtrack=False), sr=sr, hop_length=hop)

# per-second table
per_sec = []
for s in range(int(dur) + 1):
    m = (t >= s) & (t < s + 1)
    per_sec.append({"t": s, "rms": float(rms[m].mean()) if m.any() else 0.0, "vocal": float(vocal_proxy[m].mean()) if m.any() else 0.0})

# phrase segmentation: smooth vocal proxy, threshold relative to local median
k = int(0.25 * sr / hop)
vs = np.convolve(vocal_proxy, np.ones(k) / k, mode="same")
thr = np.percentile(vs, 45)
active = vs > thr
segs = []
st = None
for i, a in enumerate(active):
    if a and st is None: st = i
    if (not a) and st is not None:
        if t[i] - t[st] > 0.4: segs.append((float(t[st]), float(t[i])))
        st = None
json.dump({"duration": dur, "sr_analysis": sr, "tempo_bpm": tempo, "beats": beat_t.tolist(),
           "onsets": onsets.tolist(), "per_second": per_sec, "phrase_segments": segs,
           "silence_head_s": float(t[np.argmax(rms > 0.01)])},
          open(os.path.join(ROOT, "timing", "audio_analysis.json"), "w"), indent=1)
print("duration", round(dur, 3), "tempo", round(tempo, 1), "beats", len(beat_t), "onsets", len(onsets))
print("head silence until", float(t[np.argmax(rms > 0.01)]))
print("rms(1s) :", " ".join(f"{p['rms']*100:.0f}" for p in per_sec))
