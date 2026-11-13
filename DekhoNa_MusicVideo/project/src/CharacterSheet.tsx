import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT_DEVA } from "./theme";
import { Bust, Expr, Figure, Who } from "./components/Character";
import { AnimatedBackground, BgKind, Flowers, Tree } from "./components/AnimatedBackground";
import { LyricText } from "./components/LyricText";
import { fontCss } from "./fonts";
import { MehendiHands, AnkletCloseup } from "./components/Closeups";
import { Petals, Butterflies } from "./components/ParticleEffects";

const EXPRS: Expr[] = ["neutral", "smile", "soft", "laugh", "shy", "tease", "nervous", "love"];

/** Reference sheet: full-body turnaround-style pose set + 8-expression grid. Source of truth for each character's look. */
export const CharacterSheet: React.FC<{ who: Who }> = ({ who }) => {
  const label = who === "boy" ? "Male lead — 22–26, black slightly messy hair, cream kurta, beige trousers" : "Female lead — 21–25, long dark hair, pastel rose kurti & sage dupatta, gold earrings, payal, mehendi";
  return (
    <AbsoluteFill style={{ background: "#CFD9D6", fontFamily: FONT_DEVA, color: C.brown }}>
      <div style={{ position: "absolute", left: 60, top: 36, fontSize: 40 }}>{label}</div>
      <svg width={2000} height={1400} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1, 2].map((i) => (
          <Figure key={i} who={who} x={190 + i * 330} y={780} scale={0.95} frame={i * 20} expr={i === 1 ? "smile" : "soft"} pose={(["stand", "walk", who === "boy" ? "extend" : "twirl"] as const)[i]} />
        ))}
        {EXPRS.map((ex, i) => (
          <svg key={ex} x={1130 + (i % 4) * 215} y={130 + Math.floor(i / 4) * 330} width={205} height={270} viewBox="0 0 410 540" overflow="hidden">
            <rect x={0} y={0} width={410} height={540} rx={30} fill={C.blush} opacity={0.4} />
            <Bust who={who} expr={ex} lookX={0} />
          </svg>
        ))}
        {EXPRS.map((ex, i) => (
          <text key={ex} x={1130 + (i % 4) * 215 + 95} y={130 + Math.floor(i / 4) * 330 + 300} fontSize={22} textAnchor="middle" fill={C.brown} fontFamily="serif">{ex}</text>
        ))}
        {["#C98F6B", who === "boy" ? C.ivory : C.rose, who === "boy" ? C.beige : C.sage, "#2B201C", C.gold].map((c, i) => (
          <g key={i}>
            <circle cx={120 + i * 90} cy={1000} r={32} fill={c} stroke={C.brown} strokeWidth={2} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const BackgroundPlate: React.FC<{ kind: BgKind }> = ({ kind }) => (
  <AbsoluteFill>
    <AnimatedBackground kind={kind} frame={20} cam={{ x: 0, y: 0, z: 1 }} />
  </AbsoluteFill>
);

export const LyricOnly: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    <style>{fontCss}</style>
    <LyricText frame={frame} />
  </AbsoluteFill>
);

/** Individual illustration plates exported to assets/. */
export const IllustrationPlate: React.FC<{ kind: "flowers" | "foliage" | "petals" | "butterflies" | "mehendi" | "anklet" }> = ({ kind }) => (
  <AbsoluteFill style={{ background: kind === "anklet" ? C.ivory : C.ivory, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "scale(0.62)", transformOrigin: "0 0" }}>
      {kind === "flowers" && (
        <svg width={1080} height={1920}>
          <Flowers count={60} y0={300} y1={1800} seed={4} frame={0} colors={[C.blush, C.rose, C.ivory, C.peach, "#F7E7A8"]} size={2.2} />
        </svg>
      )}
      {kind === "foliage" && (
        <svg width={1080} height={1920}>
          <Tree x={300} y={1500} s={1.6} color={C.sage} frame={0} seed={3} />
          <Tree x={800} y={1500} s={1.3} color={C.olive} frame={0} seed={7} />
        </svg>
      )}
      {kind === "petals" && <Petals frame={30} count={60} seed={2} size={2.2} />}
      {kind === "butterflies" && <Butterflies frame={12} count={5} seed={9} />}
      {kind === "mehendi" && <MehendiHands frame={0} t={1} />}
      {kind === "anklet" && <AnkletCloseup frame={10} t={0.5} />}
    </div>
  </AbsoluteFill>
);


