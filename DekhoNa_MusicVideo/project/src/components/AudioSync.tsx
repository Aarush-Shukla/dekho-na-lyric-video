import React from "react";
import { Audio, staticFile } from "remotion";
import beats from "../data/beats.json";
import { FPS } from "../theme";

/** The original, untouched song. */
export const SongAudio: React.FC = () => <Audio src={staticFile("audio/original_song.mp3")} />;

const beatFrames: number[] = (beats as { beats: number[] }).beats.map((b) => b * FPS);

/** 0..1 pulse that decays after each detected beat (subtle visual accent only; never moves lyrics). */
export const beatPulse = (frame: number) => {
  let lo = 0, hi = beatFrames.length - 1, idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (beatFrames[mid] <= frame) { idx = mid; lo = mid + 1; } else hi = mid - 1;
  }
  if (idx < 0) return 0;
  const d = frame - beatFrames[idx];
  return Math.exp(-d / 6);
};
