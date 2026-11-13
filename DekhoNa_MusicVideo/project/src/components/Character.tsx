import React from "react";
import { C } from "../theme";

export type Who = "boy" | "girl";
export type Expr = "neutral" | "smile" | "soft" | "laugh" | "shy" | "tease" | "nervous" | "love";

export type FaceProps = {
  who: Who;
  expr?: Expr;
  /** gaze offset in px (-1..1 scaled internally) */
  lookX?: number;
  lookY?: number;
  /** 0 = open, 1 = closed (blink) */
  blink?: number;
  tilt?: number;
  /** blush 0..1 */
  blush?: number;
};

/** Head + hair, drawn in a 400x500 box. Same geometry for every shot so the couple never changes. */
export const Face: React.FC<FaceProps> = ({ who, expr = "neutral", lookX = 0, lookY = 0, blink = 0, tilt = 0, blush = 0.35 }) => {
  const girl = who === "girl";
  const skin = girl ? C.skinGirl : C.skinBoy;
  const eyeOpen = (expr === "shy" || expr === "soft" ? 0.72 : expr === "laugh" ? 0.45 : 1) * (1 - blink);
  const ey = 225;
  const ex = [160, 240];
  const lx = lookX * 7;
  const ly = lookY * 5 + (expr === "shy" || expr === "nervous" ? 3 : 0);
  const browLift = expr === "tease" ? -6 : expr === "nervous" ? -3 : expr === "love" ? -2 : 0;

  let mouth: React.ReactNode;
  const lip = girl ? "#B8625E" : "#A9685A";
  switch (expr) {
    case "laugh":
      mouth = (
        <g>
          <path d="M168 286 Q200 330 232 286 Q200 296 168 286Z" fill="#6B2F2B" />
          <path d="M175 288 Q200 297 225 288 L222 293 Q200 300 178 293Z" fill="#FFF5E9" />
        </g>
      );
      break;
    case "smile":
    case "love":
      mouth = <path d="M170 288 Q200 316 230 288" stroke={lip} strokeWidth={5} fill="none" strokeLinecap="round" />;
      break;
    case "tease":
      mouth = <path d="M174 296 Q205 306 232 282" stroke={lip} strokeWidth={5} fill="none" strokeLinecap="round" />;
      break;
    case "shy":
      mouth = <path d="M180 294 Q200 306 222 292" stroke={lip} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      break;
    case "nervous":
      mouth = <path d="M178 298 Q190 292 202 298 Q214 304 224 294" stroke={lip} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      break;
    case "soft":
      mouth = <path d="M178 292 Q200 304 222 292" stroke={lip} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
      break;
    default:
      mouth = <path d="M180 296 L220 296" stroke={lip} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  }

  const eye = (cx: number, side: -1 | 1) => (
    <g key={cx}>
      <g transform={`translate(${cx} ${ey}) scale(1 ${Math.max(0.06, eyeOpen)}) translate(${-cx} ${-ey})`}>
        <ellipse cx={cx} cy={ey} rx={girl ? 21 : 19} ry={12} fill="#FBF3EA" />
        <circle cx={cx + lx} cy={ey + ly} r={girl ? 10.5 : 10} fill="#3A2822" />
        <circle cx={cx + lx} cy={ey + ly} r={5} fill="#120C0A" />
        <circle cx={cx + lx + 3.5} cy={ey + ly - 3.5} r={2.6} fill="#FFFFFF" opacity={0.95} />
      </g>
      <path d={`M${cx - 22} ${ey - 2} Q${cx} ${ey - 20 * Math.max(0.35, eyeOpen) - 2} ${cx + 22} ${ey - 2}`} stroke={C.hair} strokeWidth={girl ? 4.5 : 4} fill="none" strokeLinecap="round" />
      {girl && <path d={`M${cx + side * 20} ${ey - 4} l${side * 8} -6`} stroke={C.hair} strokeWidth={3} strokeLinecap="round" />}
      <path
        d={`M${cx - 22} ${ey - 24 + browLift - (girl ? 0 : 2)} Q${cx} ${ey - 36 + browLift - (expr === "nervous" ? (side === 1 ? 5 : 0) : 0)} ${cx + 22} ${ey - 25 + browLift}`}
        stroke={C.hair}
        strokeWidth={girl ? 4 : 6}
        fill="none"
        strokeLinecap="round"
        opacity={0.85}
      />
    </g>
  );

  return (
    <g transform={`rotate(${tilt} 200 330)`}>
      {/* back hair (girl) */}
      {girl && (
        <path d="M96 200 C74 80 140 62 200 62 C270 62 330 82 304 210 C326 300 322 470 300 580 Q200 640 100 580 C78 470 74 300 96 200Z" fill={C.hair} />
      )}
      {/* neck */}
      <path d="M168 300 L168 392 Q200 408 232 392 L232 300Z" fill={C.skinShade} />
      {/* ears */}
      <ellipse cx={108} cy={228} rx={14} ry={23} fill={skin} />
      <ellipse cx={292} cy={228} rx={14} ry={23} fill={skin} />
      {/* head */}
      <path d="M108 205 C108 120 150 104 200 104 C250 104 292 120 292 205 C292 288 252 338 200 338 C148 338 108 288 108 205Z" fill={skin} />
      {/* hair front */}
      {girl ? (
        <path d="M100 222 C92 120 150 88 200 94 C255 88 308 122 300 222 C292 168 250 132 200 128 C150 132 108 168 100 222Z" fill={C.hair} />
      ) : (
        <g fill={C.hair}>
          <path d="M100 205 C90 98 150 70 208 76 C272 78 314 112 300 205 C292 168 272 146 246 140 C236 158 214 148 200 136 C186 152 160 144 148 138 C124 150 108 172 100 205Z" />
          <path d="M150 134 C142 116 162 104 176 112 C170 124 166 130 150 134Z" />
          <path d="M214 126 C220 104 246 100 252 116 C240 118 230 124 214 126Z" />
          <path d="M118 150 C104 140 112 118 132 122 C128 134 126 142 118 150Z" />
          <path d="M180 112 C190 94 214 92 224 108 C210 108 196 110 180 112Z" />
          <path d="M268 140 C284 134 292 152 288 170 C280 160 274 152 268 140Z" />
          <path d="M100 205 C98 232 102 252 110 264 L114 214Z" />
          <path d="M300 205 C302 232 298 252 290 264 L286 214Z" />
        </g>
      )}
      {/* cheeks */}
      <circle cx={140} cy={268} r={20} fill="#E28C80" opacity={blush * 0.55} />
      <circle cx={260} cy={268} r={20} fill="#E28C80" opacity={blush * 0.55} />
      {eye(ex[0], -1)}
      {eye(ex[1], 1)}
      <path d="M200 236 C195 262 190 270 200 273 C208 273 206 266 204 258" stroke={C.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
      {mouth}
      {girl && (
        <g>
          <circle cx={200} cy={186} r={4} fill="#B03A3A" opacity={0.85} />
          <circle cx={108} cy={252} r={5} fill={C.gold} />
          <path d="M108 256 l0 16" stroke={C.gold} strokeWidth={2.5} />
          <circle cx={108} cy={278} r={7} fill={C.gold} />
          <circle cx={292} cy={252} r={5} fill={C.gold} />
          <path d="M292 256 l0 16" stroke={C.gold} strokeWidth={2.5} />
          <circle cx={292} cy={278} r={7} fill={C.gold} />
        </g>
      )}
    </g>
  );
};

/** Head-and-shoulders bust used in close-ups (400x500 box). */
export const Bust: React.FC<FaceProps & { dupatta?: boolean }> = (p) => {
  const girl = p.who === "girl";
  return (
    <g>
      {/* shoulders */}
      {girl ? (
        <g>
          <path d="M50 1100 C44 800 36 560 74 440 Q130 392 200 396 Q270 392 326 440 C364 560 356 800 350 1100Z" fill={C.rose} />
          <path d="M150 388 Q200 428 250 388 L238 380 Q200 412 162 380Z" fill={C.blush} />
          <path d="M54 1100 C58 700 70 520 110 424 C150 480 126 700 150 1100Z" fill={C.sage} opacity={0.92} />
        </g>
      ) : (
        <g>
          <path d="M40 1100 C34 800 30 560 66 436 Q130 388 200 394 Q270 388 334 436 C370 560 366 800 360 1100Z" fill={C.beige} />
          <path d="M162 386 L200 452 L238 386 Q200 404 162 386Z" fill="#B9A387" />
          <path d="M200 452 L200 1100" stroke="#B9A387" strokeWidth={3} />
        </g>
      )}
      <Face {...p} />
    </g>
  );
};

type FigureProps = {
  who: Who;
  x: number;
  y: number; // feet baseline
  scale?: number;
  flip?: boolean;
  frame: number;
  expr?: Expr;
  pose?: "stand" | "walk" | "extend" | "twirl" | "sit" | "hand" | "heart";
  lookX?: number;
  lookY?: number;
  tilt?: number;
  blur?: number;
  opacity?: number;
  /** override walking phase offset */
  phase?: number;
  shadow?: boolean;
};

const Arm: React.FC<{ x1: number; y1: number; x2: number; y2: number; bend?: number; color: string; skin: string; w?: number }> = ({ x1, y1, x2, y2, bend = 0, color, skin, w = 24 }) => {
  const mx = (x1 + x2) / 2 + bend;
  const my = (y1 + y2) / 2;
  return (
    <g>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={w * 0.5} fill={skin} />
    </g>
  );
};

/** Full-body figure with feet at (x,y). Frame-driven, deterministic. */
export const Figure: React.FC<FigureProps> = ({ who, x, y, scale = 1, flip = false, frame, expr = "neutral", pose = "stand", lookX = 0, lookY = 0, tilt = 0, blur = 0, opacity = 1, phase = 0, shadow = true }) => {
  const girl = who === "girl";
  const skin = girl ? C.skinGirl : C.skinBoy;
  const t = (frame + phase) / 30;
  const walk = pose === "walk";
  const swing = walk ? Math.sin(t * Math.PI * 1.7) : Math.sin(t * 1.2) * 0.15;
  const bob = walk ? Math.abs(Math.sin(t * Math.PI * 1.7)) * -6 : Math.sin(t * 1.6) * -1.5;
  const twirl = pose === "twirl";
  const spin = twirl ? Math.sin(t * 2.4) : 0;
  const blink = (() => {
    const f = (frame + phase * 7) % 110;
    return f < 5 ? Math.sin((f / 5) * Math.PI) : 0;
  })();
  const sleeve = girl ? C.rose : C.ivory;
  const top = girl ? C.rose : C.ivory;
  const sx = flip ? -1 : 1;

  // arms
  let armL = { x: -64, y: -300 }, armR = { x: 64, y: -300 };
  if (walk) {
    armL = { x: -62 - swing * 6, y: -310 + swing * 4 };
    armR = { x: 62 + swing * 6, y: -310 - swing * 4 };
  }
  if (pose === "extend") armR = { x: 150, y: -400 };
  if (pose === "hand") armR = { x: 110, y: -330 };
  if (pose === "heart") armR = { x: 8, y: -392 + Math.sin(t * 3) * 3 };
  if (pose === "sit") {
    armL = { x: -50, y: -250 };
    armR = { x: 50, y: -250 };
  }
  const sit = pose === "sit";
  if (twirl) {
    armL = { x: -120, y: -440 + spin * 14 };
    armR = { x: 120, y: -420 - spin * 14 };
  }
  const legSwing = swing * 14;

  return (
    <g transform={`translate(${x} ${y + bob}) scale(${sx * scale} ${scale}) `} opacity={opacity} style={blur ? { filter: `blur(${blur}px)` } : undefined}>
      {shadow && <ellipse cx={0} cy={4} rx={girl ? 100 : 70} ry={10} fill={C.brown} opacity={0.22} />}
      {sit && (
        <defs>
          <clipPath id={`sitclip-${who}`}>
            <rect x={-300} y={-900} width={600} height={800} />
          </clipPath>
        </defs>
      )}
      {/* legs / skirt */}
      {girl ? (
        <g clipPath={sit ? `url(#sitclip-${who})` : undefined}>
          <path d={`M-44 -340 C-60 -220 ${-120 + spin * 14} -110 ${-130 + spin * 24} -30 Q0 ${-4 + spin * 6} ${130 + spin * 24} -30 C${120 + spin * 14} -110 60 -220 44 -340Z`} fill={C.blush} />
          <path d={`M-44 -340 C-30 -240 ${-60} -150 ${-92 + spin * 18} -34 L${-70 + spin * 14} -30 C-30 -150 -10 -240 -4 -340Z`} fill={C.rose} opacity={0.35} />
          <path d={`M${-130 + spin * 24} -30 Q0 ${-4 + spin * 6} ${130 + spin * 24} -30`} stroke={C.gold} strokeWidth={5} fill="none" />
          <ellipse cx={-22 - legSwing} cy={-8} rx={15} ry={7} fill={skin} />
          <ellipse cx={22 + legSwing} cy={-8} rx={15} ry={7} fill={skin} />
          <circle cx={-22 - legSwing} cy={-16} r={5} fill="none" stroke={C.gold} strokeWidth={3} />
          <circle cx={22 + legSwing} cy={-16} r={5} fill="none" stroke={C.gold} strokeWidth={3} />
        </g>
      ) : (
        <g clipPath={sit ? `url(#sitclip-${who})` : undefined}>
          <path d={`M-38 -300 L${-40 - legSwing} -14 L${-6 - legSwing} -14 L0 -290 L6 -14 L${40 + legSwing} -14 L38 -300Z`} fill={C.beige} />
          <ellipse cx={-26 - legSwing} cy={-8} rx={22} ry={9} fill={C.brown} />
          <ellipse cx={30 + legSwing} cy={-8} rx={22} ry={9} fill={C.brown} />
        </g>
      )}
      {sit && <rect x={-170} y={-118} width={340} height={26} rx={8} fill={C.brown} opacity={0.9} />}
      {/* arms behind torso for boy sleeves */}
      <Arm x1={-52} y1={-448} x2={armL.x} y2={armL.y} bend={-12} color={sleeve} skin={skin} w={girl ? 20 : 26} />
      {/* torso */}
      {girl ? (
        <path d="M-52 -452 Q0 -470 52 -452 L46 -330 Q0 -318 -46 -330Z" fill={top} />
      ) : (
        <g>
          <path d="M-62 -456 Q0 -474 62 -456 L58 -214 Q0 -200 -58 -214Z" fill={top} />
          <path d="M-58 -214 Q0 -200 58 -214 L56 -200 Q0 -186 -56 -200Z" fill={C.beige} />
          <path d="M-14 -460 L0 -420 L14 -460" stroke={C.beige} strokeWidth={3} fill="none" />
        </g>
      )}
      {girl && (
        <path d={`M-58 -456 C-30 -420 -20 -380 ${-34 + swing * 6} -300 C-80 -330 -90 -400 -58 -456Z`} fill={C.sage} opacity={0.9} />
      )}
      <Arm x1={52} y1={-448} x2={armR.x} y2={armR.y} bend={12} color={sleeve} skin={skin} w={girl ? 20 : 26} />
      {/* neck + head */}
      <g transform={`translate(-72 -600) scale(0.36)`}>
        <Face who={who} expr={expr} lookX={lookX} lookY={lookY} tilt={tilt} blink={blink} blush={0.3} />
      </g>
    </g>
  );
};


