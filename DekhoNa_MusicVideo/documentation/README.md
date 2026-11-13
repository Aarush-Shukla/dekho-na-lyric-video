# Dekho Na — Cinematic Hindi Lyric Video (Remotion project)

Vertical 1080×1920 · 30 fps · H.264/AAC MP4. Original song untouched. Lyrics are real Devanagari text layers (Noto Serif Devanagari) with the exact Romanized original beneath.

## Layout
```
DekhoNa_MusicVideo/
├─ output/        Final MP4 + thumbnail
├─ project/       Remotion + React + TypeScript source
│  └─ src/
│     ├─ Root.tsx                 composition, scene sequencing, transitions, title timing
│     ├─ components/              Scene, Character, LyricText, AnimatedBackground, CameraMovement,
│     │                           ParticleEffects, AudioSync, TitleCard, Closeups
│     ├─ scenes/sceneDefs.ts      visual direction per scene_id (edit to change imagery)
│     └─ data/                    lyrics_original.json · lyrics_devanagari.json ·
│                                 lyric_timing.json · scene_timing.json · beats.json · title.json
├─ assets/        audio (original), fonts, rendered character sheets & background plates, grain texture
├─ timing/        lyric_timing.json / .csv (+ raw analysis: audio_analysis.json, vocal_onsets.json, ASR logs)
├─ scripts/       Python analysis + timing builder, Node lyric validator
├─ renders/       preview, contact sheet, QC stills
└─ documentation/ README.md, LICENSES.md
```

## Requirements
Node ≥ 18, Python ≥ 3.10, FFmpeg/FFprobe on PATH, Google Chrome (or let Remotion download its headless shell).
Python: `pip install numpy scipy librosa soundfile pillow` (+ optional `faster-whisper` for the ASR aid).

## Install & preview
```powershell
cd project
npm install
npx remotion studio src/index.ts        # live preview/editing
```

## Re-render the final video
```powershell
cd project
node ../scripts/validate_lyrics.mjs     # must print PASSED
npx remotion render src/index.ts DekhoNa ../output/Dekho_Na_Final_1080x1920.mp4 `
  --codec=h264 --pixel-format=yuv420p --crf=16 --color-space=bt709 --audio-codec=aac --concurrency=8 `
  --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```
(`--browser-executable` is only needed if Remotion's downloaded headless shell won't launch.) Full render ≈ 1–2 h on a 12-thread CPU.

## Editing workflow
| To change… | Edit… | Then |
|---|---|---|
| a lyric spelling | `src/data/lyrics_original.json` (and regenerate `scripts/lyrics_original.lock.json` deliberately) | `python scripts/build_timing.py` |
| Devanagari rendering | `src/data/lyrics_devanagari.json` (see `review_flags`) | `python scripts/build_timing.py` |
| a line's timing | the `E` table at the top of `scripts/build_timing.py` | `python scripts/build_timing.py` (rewrites JSON + CSV + scene_timing from one dataset) |
| imagery for a beat | `src/scenes/sceneDefs.ts` | preview in Studio |
| title / emphasis words | `src/data/title.json` | – |

`build_timing.py` writes `timing/lyric_timing.json`, `timing/lyric_timing.csv`, `project/src/data/lyric_timing.json` and `scene_timing.json` from the same in-memory dataset.

## Re-run the audio analysis
```powershell
python scripts/analyze_audio.py        # RMS/onsets/beats  -> timing/audio_analysis.json
python scripts/phrase_gaps.py          # vocal-band onsets + 86 BPM beat grid -> timing/vocal_onsets.json, src/data/beats.json
python scripts/asr_whisper.py small prompt   # optional ASR aid -> timing/_asr_small_prompt.json
python scripts/probe_region.py 76 106  # pitch/energy table for any time window
```

## Timing method & honesty note
Line timings are **measured/estimated, not hand-verified by listening**: faster-whisper (Hindi) gave rough per-line anchors; each anchor was snapped (±0.2 s) to the strongest detected vocal-band onset; the post-chorus sargam lines and the final sustained "Dekho naa (Aa…)" were located from pyin pitch tracking and the 86 BPM bar grid. Each entry carries a `sync_confidence` label. Word-level times are syllable-weighted estimates inside the measured line span. Expected error is roughly ±0.2–0.3 s; to tighten it, adjust the `E` table while previewing in Remotion Studio.

## Lyric safety
`scripts/validate_lyrics.mjs` fails (exit 1) if any on-screen Romanized line differs from the locked original (spelling, punctuation, ellipses, brackets), is missing, or is out of order; if the Devanagari map is incomplete/contains Latin; if timings overlap; or if lyrics are hard-coded in source files.

## Quality checks run on the final MP4
- `ffmpeg blackdetect/freezedetect` : no black or frozen segments; `ffmpeg -f null` decode: 0 errors; 7241 packets at constant 1/30 s.
- Audio: muxed directly from `assets/audio/original_song.mp3` (48 kHz AAC 320k); cross-correlation vs original = lag 0.00 ms, corr >= 0.9999; duration identical (241.348 s).
- `python scripts/verify_video_lyrics.py output/Dekho_Na_Final_1080x1920.mp4` : takes a frame per lyric from the MP4 and pixel-matches it against reference renders of the expected text (needs `renders/lyric_ref` from composition `LyricOnly`). 55/55 lines match.
- Remux step used for the final file: `ffmpeg -i renders/_v2_raw.mp4 -i assets/audio/original_song.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 output/Dekho_Na_Final_1080x1920.mp4`.

