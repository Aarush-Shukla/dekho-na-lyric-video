import React, { useMemo } from "react";
import { C, W, H, rng } from "../theme";

export type BgKind = "sunrise" | "garden" | "lake" | "meadow" | "sunset" | "path" | "crowd" | "dream";

type Pal = { top: string; mid: string; hor: string; sun: string; sunY: number; sunR: number; far: string; mid2: string; near: string; ground: string; groundFar: string };

const PAL: Record<BgKind, Pal> = {
  sunrise: { top: C.sky, mid: C.blush, hor: C.peach, sun: "#FFE3B8", sunY: 880, sunR: 120, far: "#B9C4B2", mid2: C.sage, near: C.olive, ground: "#8FA086", groundFar: C.sage },
  garden: { top: C.sky, mid: C.ivory, hor: "#F6E3C8", sun: "#FFEBC6", sunY: 640, sunR: 90, far: C.sage, mid2: "#97A98F", near: C.olive, ground: "#93A58A", groundFar: C.sage },
  lake: { top: C.sky, mid: "#E9E0DC", hor: C.blush, sun: "#FFE8C4", sunY: 760, sunR: 100, far: "#A9B9A6", mid2: C.olive, near: "#76846A", ground: "#8DA089", groundFar: C.sage },
  meadow: { top: C.sky, mid: C.ivory, hor: C.blush, sun: "#FFE9C2", sunY: 700, sunR: 100, far: "#B2C0AA", mid2: C.sage, near: C.olive, ground: "#98AA8C", groundFar: "#A8B7A0" },
  sunset: { top: C.rose, mid: C.peach, hor: "#F8DDB8", sun: "#FFD9A0", sunY: 900, sunR: 170, far: "#B58E8C", mid2: "#A57F7C", near: "#85696A", ground: "#9B8672", groundFar: "#B59B86" },
  path: { top: C.sky, mid: "#F8EBD5", hor: "#F3D6B0", sun: "#FFEBC0", sunY: 760, sunR: 110, far: "#A8B79F", mid2: C.olive, near: "#6F7E64", ground: "#9AAC8B", groundFar: C.sage },
  crowd: { top: "#E8D6C8", mid: C.blush, hor: C.peach, sun: "#FFE0B8", sunY: 700, sunR: 100, far: "#C9B3A2", mid2: "#B79E8E", near: "#9C8575", ground: "#C8B49C", groundFar: C.beige },
  dream: { top: C.blush, mid: C.ivory, hor: "#FBE7CE", sun: "#FFEACB", sunY: 700, sunR: 140, far: "#C3CDBC", mid2: C.sage, near: C.olive, ground: "#A5B59A", groundFar: C.sage },
};

const HORIZON: Record<BgKind, number> = { sunrise: 930, garden: 900, lake: 980, meadow: 860, sunset: 930, path: 880, crowd: 980, dream: 900 };

export type Cam = { x: number; y: number; z: number };

/** Smooth hill silhouette. */
const hill = (y: number, amp: number, seed: number, fill: string, opacity = 1) => {
  const r = rng(seed);
  const pts: [number, number][] = [];
  for (let i = -1; i <= 6; i++) pts.push([i * 240 - 40, y - amp * (0.3 + r())]);
  let d = `M-300 ${H + 200} L${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, yy] = pts[i];
    d += ` Q${px + 120} ${py - amp * 0.4} ${x} ${yy}`;
  }
  d += ` L${W + 400} ${H + 200}Z`;
  return <path d={d} fill={fill} opacity={opacity} />;
};

export const Tree: React.FC<{ x: number; y: number; s: number; color: string; trunk?: string; frame: number; seed: number }> = ({ x, y, s, color, trunk = C.brown, frame, seed }) => {
  const r = rng(seed);
  const sway = Math.sin(frame / 40 + seed) * 2.5;
  const blobs = Array.from({ length: 9 }, () => ({ dx: (r() - 0.5) * 220, dy: -330 - r() * 220, rr: 70 + r() * 70 }));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 0 L-8 -360 L8 -360 L14 0Z" fill={trunk} opacity={0.85} />
      <path d="M0 -250 L60 -330" stroke={trunk} strokeWidth={9} opacity={0.8} />
      <g transform={`rotate(${sway} 0 -330)`}>
        {blobs.map((b, i) => (
          <circle key={i} cx={b.dx} cy={b.dy} r={b.rr} fill={color} opacity={0.96} />
        ))}
        {blobs.slice(0, 5).map((b, i) => (
          <circle key={"h" + i} cx={b.dx + 18} cy={b.dy - 18} r={b.rr * 0.55} fill="#FFF1D0" opacity={0.16} />
        ))}
      </g>
    </g>
  );
};

export const Flowers: React.FC<{ count: number; y0: number; y1: number; seed: number; frame: number; colors: string[]; size?: number }> = ({ count, y0, y1, seed, frame, colors, size = 1 }) => {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => {
      const t = r();
      return { x: r() * (W + 200) - 100, y: y0 + (y1 - y0) * t, t, c: colors[Math.floor(r() * colors.length)], ph: r() * 6 };
    }).sort((a, b) => a.y - b.y);
  }, [count, y0, y1, seed, colors]);
  return (
    <g>
      {items.map((f, i) => {
        const s = (0.5 + f.t) * size;
        const sw = Math.sin(frame / 22 + f.ph) * 5 * s;
        return (
          <g key={i} transform={`translate(${f.x} ${f.y})`}>
            <path d={`M0 0 Q${sw * 0.6} ${-22 * s} ${sw} ${-44 * s}`} stroke={C.olive} strokeWidth={3 * s} fill="none" strokeLinecap="round" />
            <g transform={`translate(${sw} ${-44 * s})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx={0} cy={-9 * s} rx={7 * s} ry={10 * s} fill={f.c} transform={`rotate(${a})`} />
              ))}
              <circle r={5 * s} fill="#F2CE86" />
            </g>
          </g>
        );
      })}
    </g>
  );
};

const Grass: React.FC<{ y0: number; y1: number; seed: number; frame: number; count?: number; color: string }> = ({ y0, y1, seed, frame, count = 60, color }) => {
  const items = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: count }, () => ({ x: r() * (W + 200) - 100, y: y0 + (y1 - y0) * r(), h: 20 + r() * 40, ph: r() * 6 }));
  }, [seed, y0, y1, count]);
  return (
    <g stroke={color} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.8}>
      {items.map((g, i) => {
        const sw = Math.sin(frame / 18 + g.ph) * 6;
        return <path key={i} d={`M${g.x} ${g.y} Q${g.x + sw * 0.5} ${g.y - g.h * 0.6} ${g.x + sw} ${g.y - g.h}`} />;
      })}
    </g>
  );
};

type Props = { kind: BgKind; frame: number; cam: Cam; seed?: number; blur?: number };

/**
 * Layered 2.5D illustrated backdrop. Each layer moves by cam.x * depth (parallax) and the
 * whole stack is scaled by cam.z about the lower-centre (camera push-in / pull-out).
 */
export const AnimatedBackground: React.FC<Props> = ({ kind, frame, cam, seed = 11, blur = 0 }) => {
  const p = PAL[kind];
  const hz = HORIZON[kind];
  const par = (d: number) => `translate(${-cam.x * d} ${-cam.y * d})`;
  const flowerColors = [C.blush, C.rose, C.ivory, C.peach, "#F7E7A8"];
  const sunDrift = Math.sin(frame / 90) * 6;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0, filter: blur ? `blur(${blur}px)` : undefined }}>
      <defs>
        <linearGradient id={`sky-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.top} />
          <stop offset="0.55" stopColor={p.mid} />
          <stop offset="1" stopColor={p.hor} />
        </linearGradient>
        <radialGradient id={`sun-${kind}`}>
          <stop offset="0" stopColor={p.sun} stopOpacity="1" />
          <stop offset="0.35" stopColor={p.sun} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`gr-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.groundFar} />
          <stop offset="1" stopColor={p.ground} />
        </linearGradient>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9E3E6" />
          <stop offset="1" stopColor="#97B5C2" />
        </linearGradient>
      </defs>
      <g transform={`translate(${W / 2} ${H * 0.72}) scale(${cam.z}) translate(${-W / 2} ${-H * 0.72})`}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill={`url(#sky-${kind})`} />
        <g transform={par(0.02)}>
          <circle cx={W * 0.62 + sunDrift} cy={p.sunY} r={p.sunR * 3.2} fill={`url(#sun-${kind})`} />
          <circle cx={W * 0.62 + sunDrift} cy={p.sunY} r={p.sunR} fill={p.sun} opacity={0.95} />
          {/* soft clouds */}
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={180 + i * 360 + ((frame / 6 + i * 90) % 1500) * 0.15} cy={260 + i * 90} rx={170} ry={34} fill={C.ivory} opacity={0.5} />
          ))}
        </g>
        <g transform={par(0.06)}>{hill(hz - 70, 90, seed + 1, p.far, 0.9)}</g>
        {kind === "lake" ? (
          <g transform={par(0.1)}>
            <rect x={-300} y={hz - 30} width={W + 600} height={700} fill="url(#water)" />
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={W * 0.62 - 120 + Math.sin(frame / 20 + i) * 18 - i * 4} y={hz + 20 + i * 26} width={240 - i * 12} height={5} rx={3} fill="#FFF1D2" opacity={0.45 - i * 0.03} />
            ))}
          </g>
        ) : (
          <g transform={par(0.1)}>{hill(hz + 10, 70, seed + 2, p.mid2, 0.95)}</g>
        )}
        {(kind === "sunrise" || kind === "path" || kind === "garden" || kind === "meadow" || kind === "dream") && (
          <g transform={par(0.16)}>
            <Tree x={150} y={hz + 30} s={0.9} color={p.mid2} frame={frame} seed={seed + 3} />
            <Tree x={920} y={hz + 20} s={0.75} color={p.far} frame={frame} seed={seed + 4} />
            {kind !== "meadow" && <Tree x={560} y={hz - 10} s={0.5} color={p.far} frame={frame} seed={seed + 5} />}
          </g>
        )}
        {kind === "crowd" && (
          <g transform={par(0.16)} opacity={0.9}>
            {Array.from({ length: 16 }, (_, i) => {
              const r = rng(seed + i * 13);
              const x = r() * W;
              const h = 260 + r() * 140;
              const col = [C.rose, C.sage, C.beige, C.blush, C.sky][i % 5];
              return (
                <g key={i} transform={`translate(${x} ${hz + 120 + r() * 60})`} opacity={0.75}>
                  <rect x={-34} y={-h} width={68} height={h} rx={30} fill={col} />
                  <circle cx={0} cy={-h - 40} r={34} fill={i % 2 ? C.skinBoy : C.skinGirl} />
                </g>
              );
            })}
          </g>
        )}
        {/* ground */}
        <g transform={par(0.22)}>
          {kind !== "lake" && <rect x={-300} y={hz + 20} width={W + 600} height={H - hz + 600} fill={`url(#gr-${kind})`} />}
          {kind === "path" &&<path d={`M${W / 2 - 60} ${hz + 20} L${W / 2 + 60} ${hz + 20} L${W + 380} ${H + 200} L${-380} ${H + 200}Z`} fill={C.beige} opacity={0.9} />}
          {kind === "lake" && <path d={`M-300 ${hz + 420} Q540 ${hz + 330} 1380 ${hz + 400} L1380 ${H + 600} L-300 ${H + 600}Z`} fill={`url(#gr-${kind})`} />}
          {kind === "garden" && (
            <g>
              <rect x={640} y={hz + 140} width={320} height={26} rx={8} fill={C.brown} opacity={0.85} />
              <rect x={660} y={hz + 166} width={18} height={80} fill={C.brown} opacity={0.85} />
              <rect x={922} y={hz + 166} width={18} height={80} fill={C.brown} opacity={0.85} />
              <rect x={640} y={hz + 70} width={320} height={16} rx={8} fill={C.brown} opacity={0.8} />
              <rect x={660} y={hz + 70} width={12} height={70} fill={C.brown} opacity={0.8} />
              <rect x={928} y={hz + 70} width={12} height={70} fill={C.brown} opacity={0.8} />
            </g>
          )}
        </g>
        <g transform={par(0.3)}>
          <Grass y0={kind === "lake" ? hz + 440 : hz + 60} y1={H - 100} seed={seed + 7} frame={frame} color={p.near} count={70} />
          {kind !== "crowd" && kind !== "sunset" && <Flowers count={46} y0={kind === "lake" ? hz + 450 : hz + 80} y1={H - 120} seed={seed + 8} frame={frame} colors={flowerColors} size={1} />}
          {kind === "sunset" && <Flowers count={34} y0={hz + 80} y1={H - 120} seed={seed + 8} frame={frame} colors={[C.peach, C.rose, C.ivory]} size={1} />}
        </g>
        {/* foreground silhouettes: depth cue */}
        {kind !== "crowd" && (
          <g transform={par(0.55)}>
            <Flowers count={9} y0={H - 160} y1={H + 40} seed={seed + 9} frame={frame} colors={flowerColors} size={2.4} />
          </g>
        )}
      </g>
    </svg>
  );
};

