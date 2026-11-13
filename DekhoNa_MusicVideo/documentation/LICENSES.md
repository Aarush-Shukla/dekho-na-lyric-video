# Licenses & Asset Provenance — Dekho Na lyric video

## Audio
| Item | Source | Status |
|---|---|---|
| `assets/audio/original_song.mp3` | The user's own file `Dekho Na(KoshalWorld.Com).mp3` (ID3: "Dekho Na", artist "Saksham, Smriti Thakur") | **Not owned by this project.** Supplied by the user; copied byte-for-byte, never re-synthesised, pitch/tempo unchanged. All rights remain with the original rights holders. The user is responsible for having the right to publish a video using it. |

No other music or sound effects are used.

## Fonts
| Font | Source | License |
|---|---|---|
| Noto Serif Devanagari (400, 500; Devanagari + Latin subsets, WOFF2) | npm package `@fontsource/noto-serif-devanagari` 5.1.0 (Google Fonts / Noto project) | SIL Open Font License 1.1 — see `assets/fonts/NotoSerifDevanagari-OFL.txt`. Free for commercial use and embedding. |

Lyrics are rendered as real browser text (Chromium/HarfBuzz shaping) — never as images.

## Artwork
All characters, backgrounds, flowers, petals, butterflies, mehendi/anklet details, lens flare and title cards are **original vector illustrations generated procedurally in code** (React/SVG) for this project. No stock images, stock footage, scraped illustrations, or AI-generated images were used. `assets/particles/grain.png` is synthetic Gaussian noise generated with NumPy/Pillow.

The character/background PNGs in `assets/characters/`, `assets/backgrounds/` are renders of that code.

## Software (build tooling, not distributed in the video)
| Software | License |
|---|---|
| Remotion 4.x (+ React 18) | Remotion License — free for individuals and companies of ≤3 people; larger companies need a company licence (https://remotion.pro/license). Check this applies to you before commercial use. |
| FFmpeg / FFprobe | LGPL/GPL (used locally for muxing/inspection only) |
| Python, NumPy, SciPy, librosa, Pillow, SoundFile | BSD / ISC / MIT-style |
| faster-whisper + OpenAI Whisper "small" weights (via Hugging Face `Systran/faster-whisper-small`) | MIT — used only as a rough timing aid for analysis; no Whisper output appears in the video |

## Watermarks / third-party marks
None are present in the video. (The MP3's filename contains a download-site name; it is not displayed anywhere in the video.)
