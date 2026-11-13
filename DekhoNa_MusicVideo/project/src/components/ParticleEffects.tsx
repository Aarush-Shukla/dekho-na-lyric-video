import React, { useMemo } from "react";
import { staticFile } from "remotion";
import { C, W, H, rng } from "../theme";

/** Drifting flower petals; position is a pure function of frame (deterministic). */
export const Petals: React.FC<{ frame: number; count?: number; seed?: number; wind?: number; size?: number }> = ({ frame, count = 18, seed = 3, wind = 1, size = 1 }) => {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({
      x0: r() * W,
      y0: r() * H,
      sp: 0.7 + r() * 1.4,
      amp: 20 + r() * 50,
      ph: r() * 6.28,
      rot: r() * 360,
      rs: (r() - 0.5) * 4,
      s: 0.6 + r() * 0.9,
      c: [C.blush, C.rose, C.ivory, C.peach][Math.floor(r() * 4)],
      depth: r(),
    }));
  }, [count, seed]);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {items.map((p, i) => {
        const y = (p.y0 + frame * p.sp * (1 + p.depth)) % (H + 120) - 60;
        const x = ((p.x0 + Math.sin(frame / 30 + p.ph) * p.amp + frame * 0.9 * wind * (0.5 + p.depth)) % (W + 160)) - 80;
        const rot = p.rot + frame * p.rs;
        const sc = p.s * size * (0.7 + p.depth * 0.9);
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc} ${sc * (0.6 + 0.4 * Math.abs(Math.sin(frame / 18 + p.ph)))})`} opacity={0.55 + p.depth * 0.4} style={{ filter: p.depth > 0.85 ? "blur(3px)" : undefined }}>
            <path d="M0 -14 C12 -10 12 8 0 16 C-12 8 -12 -10 0 -14Z" fill={p.c} />
          </g>
        );
      })}
    </svg>
  );
};

/** Floating golden dust motes. */
export const Dust: React.FC<{ frame: number; count?: number; seed?: number }> = ({ frame, count = 28, seed = 5 }) => {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ x: r() * W, y: r() * H, r: 1.5 + r() * 3.5, sp: 0.2 + r() * 0.5, ph: r() * 6.28, a: 0.25 + r() * 0.45 }));
  }, [count, seed]);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {items.map((d, i) => {
        const tw = 0.5 + 0.5 * Math.sin(frame / 20 + d.ph);
        return <circle key={i} cx={(d.x + Math.sin(frame / 60 + d.ph) * 40) % W} cy={(d.y - frame * d.sp + H * 3) % H} r={d.r} fill="#FFE9B8" opacity={d.a * (0.4 + tw * 0.6)} style={{ filter: "blur(0.8px)" }} />;
      })}
    </svg>
  );
};

const Butterfly: React.FC<{ x: number; y: number; s: number; frame: number; c: string; rot: number }> = ({ x, y, s, frame, c, rot }) => {
  const flap = Math.abs(Math.sin(frame / 3.2));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <g transform={`scale(${0.25 + 0.75 * flap} 1)`}>
        <path d="M0 0 C-40 -50 -80 -30 -60 10 C-50 30 -20 30 0 8Z" fill={c} opacity={0.92} />
        <path d="M0 4 C-30 20 -50 50 -26 54 C-10 54 -2 30 0 10Z" fill={C.rose} opacity={0.85} />
      </g>
      <g transform={`scale(${-(0.25 + 0.75 * flap)} 1)`}>
        <path d="M0 0 C-40 -50 -80 -30 -60 10 C-50 30 -20 30 0 8Z" fill={c} opacity={0.92} />
        <path d="M0 4 C-30 20 -50 50 -26 54 C-10 54 -2 30 0 10Z" fill={C.rose} opacity={0.85} />
      </g>
      <rect x={-2.5} y={-8} width={5} height={30} rx={2.5} fill={C.brown} />
    </g>
  );
};

export const Butterflies: React.FC<{ frame: number; count?: number; seed?: number }> = ({ frame, count = 3, seed = 9 }) => {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ cx: 200 + r() * 700, cy: 500 + r() * 600, rx: 100 + r() * 200, ry: 60 + r() * 120, sp: 0.01 + r() * 0.015, ph: r() * 6.28, s: 0.6 + r() * 0.7, c: [C.peach, C.blush, "#F7E7A8", C.sky][Math.floor(r() * 4)] }));
  }, [count, seed]);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {items.map((b, i) => {
        const a = frame * b.sp + b.ph;
        return <Butterfly key={i} x={b.cx + Math.cos(a) * b.rx} y={b.cy + Math.sin(a * 1.7) * b.ry} s={b.s} frame={frame + i * 7} c={b.c} rot={Math.cos(a) * 18} />;
      })}
    </svg>
  );
};

/** Golden-hour lens flare chain; strength 0..1 */
export const LensFlare: React.FC<{ frame: number; strength?: number }> = ({ frame, strength = 0.6 }) => {
  const sx = W * 0.82 + Math.sin(frame / 120) * 25;
  const sy = 260 + Math.cos(frame / 150) * 15;
  const dots = [
    { t: 0.0, r: 140, a: 0.4, c: "#FFE2AE" },
    { t: 0.35, r: 30, a: 0.25, c: "#F4D8D7" },
    { t: 0.55, r: 56, a: 0.14, c: "#E8B49A" },
    { t: 0.8, r: 20, a: 0.28, c: "#FFF5E9" },
    { t: 1.1, r: 80, a: 0.1, c: "#F4D8D7" },
  ];
  const cx = W / 2, cy = H / 2;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, mixBlendMode: "screen", pointerEvents: "none", opacity: strength }}>
      <defs>
        <radialGradient id="flg">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((d, i) => {
        const x = sx + (cx - sx) * d.t * 1.6;
        const y = sy + (cy - sy) * d.t * 1.6;
        return <circle key={i} cx={x} cy={y} r={d.r} fill={d.c} opacity={d.a} style={{ filter: "blur(6px)" }} />;
      })}
      <path d={`M${sx - 380} ${sy} L${sx + 380} ${sy}`} stroke="#FFF1D0" strokeWidth={3} opacity={0.35} style={{ filter: "blur(3px)" }} />
    </svg>
  );
};

/** Film grain, soft bloom, vignette and a unified warm colour grade. Always on top of the picture, below lyrics. */
export const FilmLook: React.FC<{ frame: number; beatPulse?: number; bloom?: number }> = ({ frame, beatPulse = 0, bloom = 0.22 }) => {
  const gx = (frame * 97) % 512;
  const gy = (frame * 53) % 512;
  return (
    <>
      {/* bloom */}
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: bloom * (0.55 + beatPulse * 0.35), background: "radial-gradient(ellipse 70% 45% at 70% 22%, rgba(255,226,174,0.55), rgba(255,226,174,0) 70%)" }} />
      {/* colour grade */}
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", background: "linear-gradient(180deg, rgba(255,222,180,0.22), rgba(217,166,167,0.16))" }} />
      {/* grain */}
      <div style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.16, backgroundImage: `url(${staticFile("textures/grain.png")})`, backgroundPosition: `${gx}px ${gy}px` }} />
      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 75% at 50% 45%, rgba(85,69,63,0) 55%, rgba(85,69,63,0.38) 100%)" }} />
    </>
  );
};

