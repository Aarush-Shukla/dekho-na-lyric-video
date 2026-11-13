export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  ivory: "#FFF5E9",
  blush: "#F4D8D7",
  rose: "#D9A6A7",
  sage: "#A8B7A0",
  olive: "#89977B",
  sky: "#C8DDE9",
  beige: "#D9C6AC",
  peach: "#E8B49A",
  brown: "#55453F",
  // character-only tones (derived, kept in the same warm family)
  skinBoy: "#C98F6B",
  skinGirl: "#D6A07C",
  skinShade: "#B97A58",
  hair: "#2B201C",
  henna: "#8A3F2C",
  gold: "#E9C77A",
};

/** Deterministic PRNG (mulberry32) so every render is identical. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

export const FONT_DEVA = "'Noto Serif Devanagari DN', 'Noto Serif Devanagari', serif";
