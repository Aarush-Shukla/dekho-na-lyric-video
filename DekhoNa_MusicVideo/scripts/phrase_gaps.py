"""Detect vocal phrase starts: onsets in the vocal band that follow a quiet gap. Prints candidates."""
import os, json, numpy as np, librosa
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
y, sr = librosa.load(os.path.join(ROOT, "assets", "audio", "original_song.mp3"), sr=22050, mono=True)
hop = 256
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
f = librosa.fft_frequencies(sr=sr, n_fft=2048)
# voice-formant band energy (300-3000Hz) on harmonic component only
H = librosa.decompose.hpss(S, margin=2.0)[0]
band = H[(f > 300) & (f < 3000)].sum(0)
band = band / band.max()
t = librosa.frames_to_time(np.arange(len(band)), sr=sr, hop_length=hop)
# onset strength in that band (positive log-energy derivative)
lb = np.log1p(40 * band)
d = np.maximum(0, np.diff(lb, prepend=lb[0]))
d = np.convolve(d, np.ones(3) / 3, mode="same")
peaks = librosa.util.peak_pick(d, pre_max=8, post_max=8, pre_avg=20, post_avg=20, delta=0.04, wait=12)
out = [{"t": float(t[p]), "strength": float(d[p])} for p in peaks]
json.dump({"vocal_onsets": out}, open(os.path.join(ROOT, "timing", "vocal_onsets.json"), "w"), indent=1)
# beat grid
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=512, start_bpm=86)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=512)
json.dump({"tempo_bpm": float(np.atleast_1d(tempo)[0]), "beats": [round(float(b), 3) for b in bt]}, open(os.path.join(ROOT, "project", "src", "data", "beats.json"), "w"))
print("tempo", tempo, "n beats", len(bt), "median beat", float(np.median(np.diff(bt))))
print("first beats", np.round(bt[:12], 2))
print("n vocal onsets", len(out))
