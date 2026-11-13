import React from "react";
import { C, W, H, clamp, easeInOut, easeOut } from "../theme";
import { Bust, Expr, Who } from "./Character";

const blinkAt = (frame: number, phase = 0) => {
  const f = (frame + phase) % 120;
  return f < 5 ? Math.sin((f / 5) * Math.PI) : 0;
};

/** Portrait close-up (head & shoulders) filling the upper ~70% of the frame. */
export const FaceCloseup: React.FC<{ who: Who; frame: number; t: number; expr?: Expr; lookX?: number; lookY?: number; tilt?: number; crop?: "face" | "eyes" | "wide"; side?: number }> = ({
  who,
  frame,
  t,
  expr = "smile",
  lookX = 0,
  lookY = 0,
  tilt = 0,
  crop = "face",
  side = 0,
}) => {
  const vb = crop === "eyes" ? "92 150 216 150" : crop === "wide" ? "-20 20 440 540" : "40 60 320 400";
  const breathe = Math.sin(frame / 25) * 0.4;
  const [vx, vy, vw, vh] = vb.split(" ").map(Number);
  const h = crop === "eyes" ? 760 : 1400;
  const w = (vw / vh) * h;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <svg x={(W - w) / 2 + side} y={crop === "eyes" ? 300 : crop === "wide" ? 40 : 20} width={w} height={h} viewBox={vb} overflow="visible">
        <g transform={`translate(0 ${breathe})`}>
          <Bust who={who} expr={expr} lookX={lookX + Math.sin(frame / 50) * 0.15} lookY={lookY} tilt={tilt + Math.sin(frame / 60) * 0.6} blink={blinkAt(frame, who === "girl" ? 30 : 0)} blush={0.45} />
        </g>
      </svg>
    </svg>
  );
};

const palmPath = "M380 1000 C340 840 352 690 396 640 L690 640 C732 690 744 840 704 1000 C664 1110 420 1110 380 1000Z";

const Finger: React.FC<{ x: number; len: number; w?: number; fill: string }> = ({ x, len, w = 72, fill }) => <path d={`M${x} 650 L${x} ${650 - len}`} stroke={fill} strokeWidth={w} strokeLinecap="round" />;

const OpenHand: React.FC<{ skin: string; shade: string; lines?: boolean; scale?: number; sleeve?: string }> = ({ skin, shade, lines = true, sleeve }) => (
  <g>
    {sleeve && (
      <g>
        <path d="M410 1000 L400 2100 L690 2100 L680 1000Z" fill={skin} />
        <path d="M372 1220 L350 2200 L730 2200 L708 1220Q540 1260 372 1220Z" fill={sleeve} />
      </g>
    )}
    <path d="M392 900 L268 740" stroke={skin} strokeWidth={78} strokeLinecap="round" />
    <Finger x={424} len={300} fill={skin} />
    <Finger x={492} len={360} fill={skin} />
    <Finger x={560} len={335} fill={skin} />
    <Finger x={628} len={265} fill={skin} />
    <Finger x={676} len={190} w={54} fill={skin} />
    <path d={palmPath} fill={skin} />
    {lines && (
      <g stroke={shade} strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85}>
        <path d="M420 960 C440 840 470 760 520 720 C600 700 650 740 690 780" />
        <path d="M404 770 C500 800 600 810 690 760" opacity={0.9} />
        <path d="M424 700 C500 740 580 740 660 700" opacity={0.7} />
        <path d="M530 1010 C560 900 560 840 540 780" opacity={0.6} />
        <path d="M470 960 C500 930 520 900 530 870" opacity={0.5} />
      </g>
    )}
  </g>
);

/** Boy's palm in sunlight; girl's hand slowly arrives (prog 0..1). */
export const PalmCloseup: React.FC<{ frame: number; t: number; girlHand?: boolean; girlProg?: number }> = ({ frame, t, girlHand = false, girlProg = 0 }) => {
  const g = easeInOut(girlProg);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <radialGradient id="palmGlow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#FFE9BE" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFE9BE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(0 ${-60 + Math.sin(frame / 40) * 3})`}>
        <rect x={0} y={0} width={W} height={H} fill="none" />
        <g transform={`translate(0 0) rotate(${Math.sin(frame / 70) * 0.8} 540 900) translate(540 880) scale(1.12) translate(-540 -760)`}>
          <OpenHand skin={C.skinBoy} shade={C.skinShade} sleeve={C.beige} />
          <ellipse cx={540} cy={800} rx={340} ry={300} fill="url(#palmGlow)" />
        </g>
        {girlHand && (
          <g transform={`translate(${620 - g * 330} ${420 + (1 - g) * 150}) rotate(${-18 + g * 8} 0 0) scale(0.72)`} opacity={clamp(girlProg * 4)}>
            <g transform="translate(-540 -800)">
              <OpenHand skin={C.skinGirl} shade={C.skinShade} lines={false} />
              <MehendiPattern opacity={0.9} />
              {[0, 1, 2].map((i) => (
                <ellipse key={i} cx={540} cy={1080 + i * 18} rx={190} ry={14} fill="none" stroke={C.gold} strokeWidth={6} />
              ))}
            </g>
          </g>
        )}
      </g>
    </svg>
  );
};

/** Henna mandala + finger vines drawn over a hand in the OpenHand coordinate system. */
const MehendiPattern: React.FC<{ opacity?: number; draw?: number }> = ({ opacity = 1, draw = 1 }) => {
  const dash = (len: number) => ({ strokeDasharray: len, strokeDashoffset: len * (1 - clamp(draw)) });
  return (
    <g stroke={C.henna} fill="none" strokeLinecap="round" opacity={opacity} strokeWidth={5}>
      {[70, 52, 34, 16].map((r, i) => (
        <circle key={r} cx={550} cy={840} r={r} {...dash(2 * Math.PI * r)} strokeWidth={i % 2 ? 4 : 5} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = 550 + Math.cos(a) * 70, y1 = 840 + Math.sin(a) * 70;
        const x2 = 550 + Math.cos(a) * 112, y2 = 840 + Math.sin(a) * 112;
        const cx = 550 + Math.cos(a + 0.18) * 96, cy = 840 + Math.sin(a + 0.18) * 96;
        return <path key={i} d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} {...dash(60)} />;
      })}
      {[424, 492, 560, 628].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 630 C${x - 12} 560 ${x + 12} 500 ${x} 440 C${x - 10} 390 ${x + 8} 350 ${x} ${330 - i * 6}`} {...dash(320)} />
          {[600, 540, 480, 420].map((y) => (
            <circle key={y} cx={x + (y % 120 === 0 ? 10 : -10)} cy={y} r={4.5} fill={C.henna} stroke="none" />
          ))}
        </g>
      ))}
      <path d="M404 990 C480 1040 600 1040 690 990" {...dash(320)} />
      <path d="M410 1030 C490 1080 600 1080 690 1030" {...dash(320)} strokeWidth={3.5} />
      {[440, 490, 540, 590, 640].map((x) => (
        <circle key={x} cx={x} cy={1008 + Math.abs(x - 540) * 0.05} r={4} fill={C.henna} stroke="none" />
      ))}
    </g>
  );
};

/** Girl's hands (backs facing viewer) covered in mehendi; pattern is drawn in over `t`. */
export const MehendiHands: React.FC<{ frame: number; t: number; admire?: boolean }> = ({ frame, t }) => {
  const draw = easeOut(t * 2.2);
  const hand = (tx: number, rot: number, sc: number, flip: number) => (
    <g transform={`translate(${tx} 380) rotate(${rot} 540 900) scale(${flip * sc} ${sc}) translate(${flip === -1 ? -1080 : 0} 0)`}>
      <OpenHand skin={C.skinGirl} shade={C.skinShade} lines={false} sleeve={C.rose} />
      <MehendiPattern draw={draw} />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={545} cy={1090 + i * 14} rx={190 + i * 4} ry={13} fill="none" stroke={i % 2 ? C.rose : C.gold} strokeWidth={6} />
      ))}
    </g>
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(0 ${Math.sin(frame / 45) * 4 - 180})`}>
        {hand(-250, -8, 0.78, 1)}
        {hand(260, 8, 0.78, -1)}
      </g>
    </svg>
  );
};

/** Two hands meeting / interlocking. prog 0 = apart, 1 = fingers interlaced. */
export const HandsTogether: React.FC<{ frame: number; t: number; prog?: number; mehendi?: boolean }> = ({ frame, prog = 1, mehendi = true }) => {
  const g = easeInOut(prog);
  const ys = [820, 886, 952, 1018];
  const bx = -230 + g * 190; // boy hand offset
  const gx = 230 - g * 190; // girl hand offset
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(0 ${-230 + Math.sin(frame / 50) * 3})`}>
        {/* boy: sleeve + back of hand + fingers pointing right */}
        <g transform={`translate(${bx} 0)`}>
          <path d="M-300 830 L330 850 L330 1030 L-300 1050Z" fill={C.beige} />
          <path d="M300 850 C330 842 470 836 500 846 L500 1040 C470 1046 330 1042 300 1034Z" fill={C.skinBoy} />
          {ys.map((y, i) => (
            <path key={i} d={`M480 ${y + 20} L${640 + (i === 1 ? 30 : i === 2 ? 14 : i === 3 ? -22 : 0)} ${y + 20}`} stroke={C.skinBoy} strokeWidth={72} strokeLinecap="round" />
          ))}
          <path d="M420 840 C470 790 560 780 610 800" stroke={C.skinBoy} strokeWidth={54} strokeLinecap="round" fill="none" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${600 + (i === 1 ? 30 : i === 2 ? 14 : i === 3 ? -22 : 0)} ${ys[i] + 4} l0 32`} stroke={C.skinShade} strokeWidth={3} opacity={0.45} />
          ))}
        </g>
        {/* girl: sleeve + back of hand + fingers pointing left, interleaved between the boy's fingers */}
        <g transform={`translate(${gx} 0)`}>
          <path d="M1380 830 L750 846 L750 1034 L1380 1052Z" fill={C.rose} />
          <path d="M780 850 C750 842 610 842 580 852 L580 1040 C610 1046 750 1042 780 1034Z" fill={C.skinGirl} />
          {ys.map((y, i) => (
            <path key={i} d={`M600 ${y + 52} L${440 - (i === 1 ? 20 : i === 3 ? 30 : 0)} ${y + 52}`} stroke={C.skinGirl} strokeWidth={60} strokeLinecap="round" />
          ))}
          <path d="M660 842 C610 796 520 788 470 806" stroke={C.skinGirl} strokeWidth={46} strokeLinecap="round" fill="none" />
          {mehendi && (
            <g stroke={C.henna} fill="none" strokeWidth={4} strokeLinecap="round">
              <circle cx={690} cy={944} r={34} />
              <circle cx={690} cy={944} r={18} />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <circle key={i} cx={690 + Math.cos(i * 0.785) * 52} cy={944 + Math.sin(i * 0.785) * 52} r={3.5} fill={C.henna} />
              ))}
              {ys.map((y, i) => (
                <path key={i} d={`M620 ${y + 52} L${520 - (i === 1 ? 20 : 0)} ${y + 52}`} strokeDasharray="2 12" />
              ))}
            </g>
          )}
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={792 + i * 16} cy={942} rx={12} ry={84} fill="none" stroke={i % 2 ? C.rose : C.gold} strokeWidth={6} />
          ))}
        </g>
      </g>
    </svg>
  );
};
/** Girl's anklet (payal): a bare foot stepping through grass, ghungroo beads swaying. */
export const AnkletCloseup: React.FC<{ frame: number; t: number }> = ({ frame }) => {
  const step = Math.sin((frame / 30) * Math.PI * 1.4);
  const leg = (key: string, x: number, lift: number, rot: number, opacity: number, blur: number) => (
    <g key={key} transform={`translate(${x} ${900 - lift}) rotate(${rot}) scale(2.1)`} opacity={opacity} style={blur ? { filter: `blur(${blur}px)` } : undefined}>
      <path d="M-40 -380 C-42 -230 -36 -110 -30 -26 C-28 36 -6 68 52 72 L132 78 C170 78 174 38 136 28 L62 6 C42 -10 38 -60 40 -380Z" fill={C.skinGirl} />
      <path d="M-40 -380 C-42 -230 -36 -110 -30 -26" stroke={C.skinShade} strokeWidth={5} fill="none" opacity={0.35} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${60 + i * 16} 74 l0 -10`} stroke={C.skinShade} strokeWidth={2} opacity={0.4} />
      ))}
      <ellipse cx={0} cy={-52} rx={45} ry={11} fill="none" stroke={C.gold} strokeWidth={8} />
      {[-30, -15, 0, 15, 30].map((bx, i) => (
        <g key={i} transform={`translate(${bx} ${-48 + Math.sin(frame / 5 + i) * 2.5})`}>
          <path d="M0 0 L0 20" stroke={C.gold} strokeWidth={2.2} />
          <circle cx={0} cy={27} r={8} fill={C.gold} />
          <circle cx={-2.5} cy={24} r={2.6} fill="#FFF3C9" />
        </g>
      ))}
    </g>
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      {leg("b", 700, Math.max(0, -step) * 70, 3, 0.7, 2)}
      {leg("a", 470, Math.max(0, step) * 70, -3, 1, 0)}
      <path d="M-100 150 Q540 60 1180 150 L1180 -100 L-100 -100Z" fill={C.blush} />
      <path d="M-100 150 Q540 60 1180 150" stroke={C.gold} strokeWidth={8} fill="none" />
      <path d="M-100 175 Q540 85 1180 175" stroke={C.rose} strokeWidth={4} fill="none" />
      <g opacity={0.85}>
        {Array.from({ length: 10 }, (_, i) => (
          <ellipse key={i} cx={(i * 133 + frame * 0.6) % (W + 100)} cy={1250 + (i % 3) * 40} rx={14} ry={7} fill={[C.blush, C.rose, C.ivory][i % 3]} />
        ))}
      </g>
    </svg>
  );
};
/** Blurred second figure for depth in portrait shots. */
export const BlurBust: React.FC<{ who: Who; x: number; y: number; scale: number; expr?: Expr; frame: number; blur?: number; opacity?: number }> = ({ who, x, y, scale, expr = "soft", frame, blur = 14, opacity = 0.8 }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, filter: `blur(${blur}px)`, opacity }}>
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Bust who={who} expr={expr} lookX={-0.5} blink={blinkAt(frame, 60)} />
    </g>
  </svg>
);



