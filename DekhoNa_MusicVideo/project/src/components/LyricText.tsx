import React from "react";
import { C, FONT_DEVA, clamp, easeOut } from "../theme";
import timing from "../data/lyric_timing.json";
import meta from "../data/title.json";

type Word = { word: string; start_seconds: number; end_seconds: number };
type Entry = {
  id: string;
  original_text: string;
  devanagari_text: string;
  start_frame: number;
  end_frame: number;
  word_timings: Word[];
  animation: "fade-rise" | "word-reveal" | "mask-reveal" | "scale-in";
};
export const ENTRIES = (timing as unknown as { entries: Entry[] }).entries;
const FPS = 30;

const stems: string[] = meta.emphasis_stems;
const isEmph = (w: string) => stems.some((s) => w.toLowerCase().replace(/[^a-z]/g, "").startsWith(s));

export const activeEntry = (frame: number) => ENTRIES.find((e) => frame >= e.start_frame && frame < e.end_frame + 8);

/**
 * Lyric layer: real font-rendered Devanagari (Noto Serif Devanagari, shaped by the browser's HarfBuzz)
 * with the exact Romanized original beneath. Whole words / whole lines are animated – never individual glyphs.
 */
export const LyricText: React.FC<{ frame: number }> = ({ frame }) => {
  const e = activeEntry(frame);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 760, background: "linear-gradient(to top, rgba(85,69,63,0.55), rgba(85,69,63,0.28) 45%, rgba(85,69,63,0))" }} />
      {e && <Line e={e} frame={frame} />}
    </div>
  );
};

const Line: React.FC<{ e: Entry; frame: number }> = ({ e, frame }) => {
  const lf = frame - e.start_frame;
  const dur = e.end_frame - e.start_frame;
  const fadeOut = clamp((e.end_frame + 8 - frame) / 8);
  const devWords = e.devanagari_text.split(" ");
  const romWords = e.original_text.split(" ");
  const len = e.devanagari_text.length;
  const devSize = len <= 20 ? 84 : len <= 30 ? 76 : len <= 38 ? 66 : 58;
  const romSize = e.original_text.length > 44 ? 29 : e.original_text.length > 36 ? 33 : 38;

  let blockStyle: React.CSSProperties = {};
  const a = e.animation;
  const rise = easeOut(lf / 15);
  if (a === "fade-rise") blockStyle = { opacity: rise, transform: `translateY(${(1 - rise) * 26}px)` };
  else if (a === "scale-in") blockStyle = { opacity: easeOut(lf / 14), transform: `scale(${0.96 + 0.04 * easeOut(lf / 18)})` };
  else if (a === "mask-reveal") {
    const rd = Math.max(22, Math.min(48, dur * 0.35));
    const p = easeOut(lf / rd);
    blockStyle = { opacity: clamp(lf / 6), clipPath: `inset(-30px ${(1 - p) * 100}% -30px -30px)`, transform: `translateY(${(1 - p) * 10}px)` };
  } else blockStyle = { opacity: clamp(lf / 6) };

  const wordStyle = (idx: number, n: number, wordsArr: Word[]): React.CSSProperties => {
    if (a !== "word-reveal") return {};
    const wt = wordsArr[Math.min(wordsArr.length - 1, Math.floor((idx * wordsArr.length) / n))];
    const wf = Math.round(wt.start_seconds * FPS) - e.start_frame - 3;
    const p = easeOut((lf - wf) / 10);
    return { opacity: p, transform: `translateY(${(1 - p) * 16}px)`, display: "inline-block" };
  };
  const emphStyle = (word: string, rIdx: number): React.CSSProperties => {
    if (!isEmph(word)) return {};
    const wt = e.word_timings[Math.min(rIdx, e.word_timings.length - 1)];
    const f0 = Math.round(wt.start_seconds * FPS) - e.start_frame;
    const g = clamp((lf - f0) / 12);
    return { color: `rgb(${255 - 11 * g}, ${245 - 55 * g}, ${233 - 71 * g})`, textShadow: `0 0 ${24 * g}px rgba(232,180,154,${0.8 * g}), 0 2px 10px rgba(85,69,63,0.45)` };
  };

  return (
    <div style={{ position: "absolute", left: 110, right: 110, top: 1450, height: 380, display: "flex", alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      <div style={{ ...blockStyle, textAlign: "center", width: "100%" }}>
        <div style={{ fontFamily: FONT_DEVA, fontWeight: 500, fontSize: devSize, lineHeight: 1.45, color: C.ivory, textShadow: "0 2px 12px rgba(85,69,63,0.55)", textWrap: "balance" as never }}>
          {devWords.map((w, i) => {
            const rIdx = Math.min(romWords.length - 1, Math.floor((i * romWords.length) / devWords.length));
            return (
              <React.Fragment key={i}>
                <span style={{ ...wordStyle(i, devWords.length, e.word_timings), ...emphStyle(romWords[rIdx], rIdx), display: "inline-block", whiteSpace: "nowrap" }}>{w}</span>
                {i < devWords.length - 1 ? " " : ""}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontFamily: FONT_DEVA, fontWeight: 400, fontSize: romSize, lineHeight: 1.4, letterSpacing: "0.03em", color: C.blush, opacity: 0.92, textShadow: "0 1px 8px rgba(85,69,63,0.6)" }}>
          {romWords.map((w, i) => (
            <React.Fragment key={i}>
              <span style={{ ...wordStyle(i, romWords.length, e.word_timings), display: "inline-block", whiteSpace: "nowrap" }}>{w}</span>
              {i < romWords.length - 1 ? " " : ""}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
