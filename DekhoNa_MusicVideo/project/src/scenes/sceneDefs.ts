import type { BgKind } from "../components/AnimatedBackground";
import type { CamSpec } from "../components/CameraMovement";
import type { Expr, Who } from "../components/Character";

export type CharDef = {
  who: Who;
  x: number;
  y: number;
  s?: number;
  toX?: number;
  toY?: number;
  toS?: number;
  flip?: boolean;
  expr?: Expr;
  pose?: "stand" | "walk" | "extend" | "twirl" | "sit" | "hand" | "heart";
  lookX?: number;
  lookY?: number;
  tilt?: number;
  blur?: number;
  opacity?: number;
};

export type CloseDef =
  | { type: "face"; who: Who; expr?: Expr; lookX?: number; lookY?: number; lookToX?: number; lookToY?: number; tilt?: number; crop?: "face" | "eyes" | "wide"; side?: number; behind?: { who: Who; x: number; y: number; scale: number; expr?: Expr } }
  | { type: "pair"; boyExpr?: Expr; girlExpr?: Expr; gap: [number, number] }
  | { type: "palm"; girlHand?: boolean }
  | { type: "mehendi" }
  | { type: "hands"; prog: [number, number]; mehendi?: boolean }
  | { type: "anklet" };

export type SceneDef = {
  bg: BgKind;
  bgBlur?: number;
  seed?: number;
  cam?: CamSpec;
  chars?: CharDef[];
  close?: CloseDef;
  petals?: number;
  dust?: number;
  butterflies?: number;
  flare?: number;
  memory?: boolean;
  trans?: "dissolve" | "light" | "wipe" | "cut" | "match";
  transFrames?: number;
  note?: string;
};

const B = (o: Partial<CharDef>): CharDef => ({ who: "boy", x: 540, y: 1380, ...o });
const G = (o: Partial<CharDef>): CharDef => ({ who: "girl", x: 540, y: 1380, ...o });

/** Visual direction per scene_id (ids match timing/lyric_timing.json + instrumental scenes). */
export const SCENES: Record<string, SceneDef> = {
  // ---------------- INTRO (instrumental) ----------------
  intro_a: { bg: "sunrise", cam: { z: [1.0, 1.14], y: [0, -40] }, petals: 8, dust: 26, flare: 0.7, trans: "cut" },
  intro_b: { bg: "sunrise", cam: { z: [1.04, 1.2], x: [0, 30] }, chars: [B({ x: 280, y: 1340, s: 0.78, expr: "soft", lookX: 0.8 })], petals: 10, dust: 22, flare: 0.6, trans: "dissolve", transFrames: 30 },
  intro_c: { bg: "sunrise", cam: { z: [1.0, 1.22], x: [0, 60] }, chars: [B({ x: 260, y: 1340, s: 0.78, expr: "shy", lookX: 0.9 }), G({ x: 800, y: 1030, s: 0.28, toX: 740, toY: 1060, toS: 0.34, pose: "walk", expr: "smile" })], petals: 12, dust: 24, flare: 0.7, trans: "dissolve", transFrames: 30 },

  // ---------------- VERSE 1 ----------------
  scene_V1_L1: { bg: "garden", cam: { z: [1.0, 1.1], x: [0, 20] }, chars: [B({ x: 250, y: 1370, s: 0.82, expr: "shy", lookX: 0.9, tilt: -3 }), G({ x: 800, y: 1060, s: 0.32, expr: "soft" })], petals: 8, dust: 20, flare: 0.5, trans: "dissolve", transFrames: 30 },
  scene_V1_L2: { bg: "dream", bgBlur: 5, cam: { z: [1.0, 1.1] }, chars: [G({ x: 540, y: 1380, s: 0.92, expr: "laugh", pose: "stand", lookX: -0.3 })], memory: true, petals: 12, dust: 20 },
  scene_V1_L3: { bg: "garden", bgBlur: 14, cam: { z: [1.0, 1.05] }, close: { type: "face", who: "boy", expr: "smile", lookX: 0.5 }, petals: 22, dust: 14, flare: 0.5 },
  scene_V1_L4: { bg: "garden", cam: { z: [1.02, 1.12], x: [0, -20] }, chars: [B({ x: 200, y: 1250, s: 0.5, expr: "shy", blur: 3 }), G({ x: 660, y: 1380, s: 0.95, expr: "tease", lookX: -0.7, tilt: 6 })], petals: 10, dust: 18 },

  // ---------------- VERSE 2 ----------------
  scene_V2_L1: { bg: "garden", bgBlur: 18, close: { type: "palm" }, cam: { z: [1.0, 1.08] }, dust: 36, flare: 0.8, petals: 6, trans: "light", transFrames: 18 },
  scene_V2_L2: { bg: "garden", bgBlur: 18, close: { type: "palm", girlHand: true }, cam: { z: [1.08, 1.12] }, dust: 36, flare: 0.8, petals: 6 },
  scene_V2_L3: { bg: "garden", bgBlur: 4, cam: { z: [1.0, 1.12] }, chars: [B({ x: 540, y: 1400, s: 1.0, expr: "shy", lookY: 1, tilt: -4 })], petals: 12, dust: 18 },
  scene_V2_L4: { bg: "path", cam: { z: [1.0, 1.14] }, chars: [G({ x: 540, y: 1010, s: 0.34, toY: 1400, toS: 0.88, pose: "walk", expr: "smile" })], petals: 16, dust: 22, flare: 0.6, trans: "wipe", transFrames: 20 },

  // ---------------- PRE-CHORUS 1 ----------------
  scene_PC1_L1: { bg: "lake", cam: { z: [1.0, 1.1], x: [0, 20] }, chars: [B({ x: 400, y: 1400, s: 0.92, expr: "soft", lookX: 0.6 })], dust: 18, petals: 4, flare: 0.6, trans: "dissolve", transFrames: 24 },
  scene_PC1_L2: { bg: "lake", cam: { z: [1.05, 1.12] }, chars: [B({ x: 380, y: 1400, s: 0.92, expr: "soft", lookX: 0.7 }), G({ x: 1050, y: 1400, toX: 740, s: 0.92, expr: "smile", lookX: -0.6 })], dust: 18, petals: 4, flare: 0.5 },
  scene_PC1_L3: { bg: "lake", bgBlur: 14, close: { type: "face", who: "boy", expr: "nervous", lookX: 0.3, lookY: 0.2, tilt: 3 }, dust: 16, petals: 6, flare: 0.5 },
  scene_PC1_L4: { bg: "lake", cam: { z: [1.05, 1.16] }, chars: [B({ x: 330, toX: 450, y: 1400, s: 0.95, expr: "shy", lookX: 0.8 }), G({ x: 760, y: 1400, s: 0.95, expr: "soft", lookX: -0.8 })], dust: 18, petals: 5 },
  scene_PC1_L5: { bg: "lake", cam: { z: [1.12, 1.24] }, chars: [B({ x: 400, y: 1400, s: 1.0, expr: "smile", lookX: 0.9 }), G({ x: 700, y: 1400, s: 1.0, expr: "smile", lookX: -0.9 })], dust: 24, petals: 6, flare: 1.0 },
  scene_PC1_L6: { bg: "lake", bgBlur: 14, close: { type: "face", who: "girl", expr: "love", lookX: -0.4, behind: { who: "boy", x: 40, y: 620, scale: 1.4, expr: "soft" } }, dust: 20, petals: 8, flare: 0.8 },

  // ---------------- CHORUS 1 ----------------
  scene_C1_L1: { bg: "meadow", bgBlur: 14, close: { type: "face", who: "boy", expr: "love", lookX: 0.9, tilt: 4, behind: { who: "girl", x: 520, y: 700, scale: 1.2, expr: "smile" } }, petals: 20, dust: 16, flare: 0.8, trans: "match", transFrames: 12 },
  scene_C1_L2: { bg: "dream", bgBlur: 8, close: { type: "face", who: "girl", expr: "laugh", lookX: -0.2, tilt: -5 }, memory: true, petals: 18, dust: 14 },
  scene_C1_L3: { bg: "meadow", bgBlur: 14, close: { type: "face", who: "boy", expr: "shy", lookX: 0.4, lookY: 0.5, crop: "wide" }, petals: 18, dust: 14, flare: 0.6 },
  scene_C1_L4: { bg: "meadow", bgBlur: 14, close: { type: "face", who: "girl", expr: "smile", tilt: -9, lookX: -0.3 }, petals: 18, dust: 14, flare: 0.7 },
  scene_C1_L5: { bg: "meadow", bgBlur: 10, cam: { z: [1.0, 1.14] }, close: { type: "pair", boyExpr: "love", girlExpr: "love", gap: [255, 235] }, petals: 34, dust: 22, flare: 1.0 },

  // ---------------- POST-CHORUS ----------------
  scene_PO_L1: { bg: "meadow", cam: { z: [1.0, 1.1], x: [0, 20] }, chars: [G({ x: 540, y: 1410, s: 1.0, pose: "twirl", expr: "laugh" })], petals: 22, dust: 22, butterflies: 2, flare: 0.8, trans: "wipe", transFrames: 20 },
  scene_PO_L2: { bg: "meadow", cam: { z: [1.05, 1.12] }, chars: [G({ x: 780, y: 1180, s: 0.55, pose: "twirl", expr: "laugh" }), B({ x: 330, y: 1400, s: 1.0, expr: "laugh", lookX: 0.7 })], petals: 18, dust: 20, butterflies: 2 },
  scene_PO_L3: { bg: "dream", cam: { z: [1.0, 1.16], y: [0, -30] }, chars: [], petals: 26, dust: 30, butterflies: 6, flare: 1.0 },

  // ---------------- HOOK (instrumental) ----------------
  hook_a: { bg: "path", cam: { z: [1.0, 1.12], x: [-30, 40] }, chars: [B({ x: 430, y: 1200, s: 0.55, pose: "walk", expr: "smile" }), G({ x: 600, y: 1200, s: 0.55, pose: "walk", expr: "smile" })], petals: 10, dust: 30, flare: 0.7, trans: "dissolve", transFrames: 24 },
  hook_b: { bg: "meadow", cam: { z: [1.05, 1.12], x: [40, -40] }, chars: [B({ x: 440, y: 1230, s: 0.6, pose: "walk", expr: "soft" }), G({ x: 620, y: 1230, s: 0.6, pose: "walk", expr: "smile" })], petals: 12, dust: 30, butterflies: 2, flare: 0.7 },
  hook_c: { bg: "path", seed: 21, cam: { z: [1.08, 1.2], x: [-20, 30] }, chars: [B({ x: 410, y: 1260, s: 0.66, pose: "walk", expr: "smile" }), G({ x: 620, y: 1260, s: 0.66, pose: "walk", expr: "love" })], petals: 14, dust: 32, flare: 0.9 },

  // ---------------- VERSE 3 ----------------
  scene_V3_L1: { bg: "garden", cam: { z: [1.02, 1.22] }, chars: [B({ x: 540, y: 1400, s: 1.0, expr: "nervous", lookX: 0.2 })], petals: 8, dust: 20, flare: 0.5, trans: "dissolve", transFrames: 30 },
  scene_V3_L2: { bg: "crowd", bgBlur: 8, cam: { z: [1.0, 1.1] }, chars: [G({ x: 540, y: 1410, s: 1.02, expr: "smile", lookX: -0.3 })], dust: 20, petals: 4, flare: 0.5 },
  scene_V3_L3: { bg: "meadow", cam: { z: [1.05, 1.18] }, chars: [B({ x: 380, y: 1410, s: 1.0, pose: "extend", expr: "soft", lookX: 0.8 }), G({ x: 740, y: 1410, s: 1.0, flip: true, pose: "hand", expr: "smile", lookX: -0.8 })], petals: 12, dust: 20, flare: 0.8 },
  scene_V3_L4: { bg: "sunset", cam: { z: [1.0, 1.12], x: [-30, 30] }, chars: [B({ x: 450, y: 1300, s: 0.8, pose: "walk", expr: "smile" }), G({ x: 640, y: 1300, s: 0.8, pose: "walk", expr: "love" })], petals: 16, dust: 28, flare: 1.0 },

  // ---------------- VERSE 4 ----------------
  scene_V4_L1: { bg: "garden", cam: { z: [1.0, 1.1] }, chars: [B({ x: 300, y: 1400, s: 0.95, expr: "nervous", lookX: 0.6, lookY: 0.3 }), G({ x: 760, y: 1400, s: 0.95, flip: true, expr: "tease", lookX: -0.8, tilt: 4 })], petals: 8, dust: 16, trans: "dissolve", transFrames: 30 },
  scene_V4_L2: { bg: "garden", bgBlur: 14, close: { type: "face", who: "girl", expr: "tease", tilt: 9, lookX: -0.5, lookY: -0.2 }, petals: 10, dust: 14, flare: 0.5 },
  scene_V4_L3: { bg: "garden", cam: { z: [1.05, 1.22] }, chars: [G({ x: 540, y: 1420, s: 1.05, pose: "heart", expr: "soft", lookX: -0.3 })], petals: 12, dust: 16, flare: 0.6 },
  scene_V4_L4: { bg: "garden", bgBlur: 14, close: { type: "face", who: "girl", expr: "soft", crop: "eyes", lookX: -0.7 }, petals: 10, dust: 14, flare: 0.5 },
  scene_V4_L5: { bg: "garden", bgBlur: 10, cam: { z: [1.0, 1.14] }, close: { type: "pair", boyExpr: "soft", girlExpr: "love", gap: [250, 232] }, petals: 16, dust: 18, flare: 0.8 },
  scene_V4_L6: { bg: "garden", bgBlur: 14, close: { type: "face", who: "boy", expr: "laugh", lookX: 0.2, tilt: -4 }, petals: 22, dust: 16, flare: 0.9 },

  // ---------------- VERSE 5 ----------------
  scene_V5_L1: { bg: "garden", cam: { z: [1.02, 1.14] }, chars: [G({ x: 790, y: 1300, s: 0.88, pose: "sit", expr: "soft", lookX: -0.8 })], petals: 10, dust: 20, flare: 0.6, trans: "dissolve", transFrames: 30 },
  scene_V5_L2: { bg: "garden", bgBlur: 14, close: { type: "face", who: "girl", expr: "soft", crop: "eyes", lookX: -0.9, lookY: 0.1 }, petals: 8, dust: 14 },
  scene_V5_L3: { bg: "garden", cam: { z: [1.0, 1.1] }, chars: [B({ x: 120, y: 1250, s: 0.62, toX: 640, pose: "walk", expr: "smile" }), G({ x: 880, y: 1420, s: 1.0, expr: "soft", lookX: -0.9, blur: 3 })], petals: 12, dust: 18 },
  scene_V5_L4: { bg: "garden", bgBlur: 14, close: { type: "face", who: "girl", expr: "tease", tilt: -7, lookX: -0.4 }, petals: 12, dust: 14, flare: 0.6 },
  scene_V5_L5: { bg: "garden", cam: { z: [1.05, 1.16] }, chars: [B({ x: 360, y: 1410, s: 1.0, expr: "shy", lookX: 0.6 }), G({ x: 1000, toX: 690, y: 1410, s: 1.0, flip: true, pose: "hand", expr: "smile", lookX: -0.8 })], petals: 12, dust: 18 },
  scene_V5_L6: { bg: "dream", bgBlur: 7, cam: { z: [1.0, 1.15] }, chars: [B({ x: 400, y: 1260, s: 0.6, expr: "smile" }), G({ x: 640, y: 1260, s: 0.6, expr: "love" })], petals: 40, dust: 30, butterflies: 4, flare: 1.0, trans: "light", transFrames: 20 },
  scene_V5_L7: { bg: "meadow", bgBlur: 10, cam: { z: [1.0, 1.12] }, close: { type: "pair", boyExpr: "smile", girlExpr: "smile", gap: [245, 232] }, petals: 20, dust: 18, flare: 0.8 },
  scene_V5_L8: { bg: "garden", bgBlur: 20, close: { type: "hands", prog: [0.2, 0.9] }, cam: { z: [1.0, 1.08] }, petals: 8, dust: 26, flare: 0.8 },

  // ---------------- PRE-CHORUS 2 ----------------
  scene_PC2_L1: { bg: "garden", bgBlur: 20, close: { type: "mehendi" }, cam: { z: [1.0, 1.08] }, petals: 8, dust: 24, flare: 0.7, trans: "match", transFrames: 12 },
  scene_PC2_L2: { bg: "garden", bgBlur: 14, close: { type: "face", who: "boy", expr: "soft", lookX: 0, lookY: 1, tilt: -3 }, petals: 10, dust: 16, flare: 0.5 },
  scene_PC2_L3: { bg: "garden", bgBlur: 4, close: { type: "anklet" }, cam: { z: [1.0, 1.06] }, petals: 20, dust: 12 },
  scene_PC2_L4: { bg: "garden", bgBlur: 14, close: { type: "face", who: "girl", expr: "love", lookX: -0.3, tilt: -4 }, petals: 14, dust: 14, flare: 0.8 },
  scene_PC2_L5: { bg: "garden", bgBlur: 20, close: { type: "hands", prog: [0, 0.75], mehendi: true }, cam: { z: [1.0, 1.08] }, petals: 8, dust: 24, flare: 0.8 },
  scene_PC2_L6: { bg: "sunset", bgBlur: 10, cam: { z: [1.0, 1.2] }, close: { type: "pair", boyExpr: "love", girlExpr: "love", gap: [240, 215] }, petals: 20, dust: 22, flare: 1.0 },

  // ---------------- FINAL CHORUS (girl's perspective) ----------------
  scene_FC_L1: { bg: "sunset", bgBlur: 14, close: { type: "face", who: "girl", expr: "love", lookX: -0.9, behind: { who: "boy", x: 20, y: 640, scale: 1.4, expr: "smile" } }, petals: 20, dust: 16, flare: 1.0, trans: "light", transFrames: 24 },
  scene_FC_L2: { bg: "dream", bgBlur: 8, close: { type: "face", who: "girl", expr: "smile", lookX: -0.2, tilt: -4 }, memory: true, petals: 18, dust: 14 },
  scene_FC_L3: { bg: "sunset", bgBlur: 14, close: { type: "face", who: "girl", expr: "shy", lookX: 0.4, lookY: 1, lookToX: -0.9, lookToY: 0, tilt: 4 }, petals: 16, dust: 14, flare: 0.8 },
  scene_FC_L4: { bg: "sunset", bgBlur: 14, close: { type: "face", who: "boy", expr: "smile", lookX: 0.7, tilt: 3 }, petals: 20, dust: 14, flare: 0.8 },
  scene_FC_L5: { bg: "sunset", bgBlur: 20, close: { type: "hands", prog: [0.55, 0.65], mehendi: true }, cam: { z: [1.0, 1.06] }, petals: 8, dust: 26, flare: 0.9 },
  scene_FC_L6: { bg: "sunset", bgBlur: 20, close: { type: "hands", prog: [0.65, 1] , mehendi: true }, cam: { z: [1.06, 1.12] }, petals: 8, dust: 26, flare: 0.9 },
  scene_FC_L7: { bg: "sunset", bgBlur: 14, close: { type: "face", who: "girl", expr: "soft", lookX: -0.4, tilt: -3 }, petals: 18, dust: 14, flare: 0.9 },
  scene_FC_L8: { bg: "sunset", bgBlur: 10, cam: { z: [1.0, 1.16] }, close: { type: "pair", boyExpr: "love", girlExpr: "love", gap: [285, 225] }, petals: 22, dust: 20, flare: 1.0 },
  scene_FC_L9: { bg: "sunset", cam: { z: [1.28, 1.0], y: [-60, 0] }, chars: [B({ x: 470, y: 1330, toY: 1090, s: 0.9, toS: 0.34, pose: "walk", expr: "smile", flip: false }), G({ x: 650, y: 1330, toY: 1090, s: 0.9, toS: 0.34, pose: "walk", expr: "love" })], petals: 24, dust: 30, flare: 1.0, trans: "dissolve", transFrames: 24 },
  outro: { bg: "sunset", cam: { z: [1.0, 1.04] }, chars: [B({ x: 470, y: 1330, s: 0.34, pose: "stand", expr: "smile", opacity: 0.95 }), G({ x: 610, y: 1330, s: 0.34, pose: "stand", expr: "love", opacity: 0.95 })], petals: 14, dust: 24, flare: 0.8, trans: "dissolve", transFrames: 45 },
};

