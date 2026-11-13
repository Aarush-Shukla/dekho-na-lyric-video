import React from "react";
import { W, H, lerp, easeInOut } from "../theme";
import { AnimatedBackground } from "./AnimatedBackground";
import { Bust, Figure } from "./Character";
import { camAt, CameraMovement } from "./CameraMovement";
import { AnkletCloseup, BlurBust, FaceCloseup, HandsTogether, MehendiHands, PalmCloseup } from "./Closeups";
import { Butterflies, Dust, LensFlare, Petals } from "./ParticleEffects";
import type { SceneDef, CloseDef } from "../scenes/sceneDefs";

const Pair: React.FC<{ def: Extract<CloseDef, { type: "pair" }>; t: number; frame: number }> = ({ def, t, frame }) => {
  const gap = lerp(def.gap[0], def.gap[1], easeInOut(t));
  const sc = 1.2;
  const blink = (ph: number) => {
    const f = (frame + ph) % 130;
    return f < 5 ? Math.sin((f / 5) * Math.PI) : 0;
  };
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <g transform={`translate(${W / 2 - gap - 200 * sc} 300) scale(${sc})`}>
        <Bust who="boy" expr={def.boyExpr ?? "smile"} lookX={0.95} blink={blink(0)} tilt={5} blush={0.5} />
      </g>
      <g transform={`translate(${W / 2 + gap - 200 * sc} 300) scale(${sc})`}>
        <Bust who="girl" expr={def.girlExpr ?? "smile"} lookX={-0.95} blink={blink(40)} tilt={-5} blush={0.5} />
      </g>
    </svg>
  );
};

/** Renders one visual beat. `t` = scene progress 0..1, `lf` = local frame. */
export const Scene: React.FC<{ def: SceneDef; lf: number; t: number; frame: number }> = ({ def, lf, t, frame }) => {
  const cam = camAt(def.cam, t);
  const c = def.close;
  const e = easeInOut(t);
  const bgBlur = (def.bgBlur ?? 0) + (def.memory ? 4 : 0);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", filter: def.memory ? "saturate(0.8) brightness(1.06)" : undefined }}>
      <AnimatedBackground kind={def.bg} frame={frame} cam={cam} seed={def.seed ?? 11} blur={bgBlur} />
      {def.chars && def.chars.length > 0 && (
        <CameraMovement cam={cam} depth={0.6}>
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
            {def.chars.map((ch, i) => (
              <Figure
                key={i}
                who={ch.who}
                x={lerp(ch.x, ch.toX ?? ch.x, e)}
                y={lerp(ch.y, ch.toY ?? ch.y, e)}
                scale={lerp(ch.s ?? 1, ch.toS ?? ch.s ?? 1, e)}
                flip={ch.flip}
                frame={frame}
                expr={ch.expr}
                pose={ch.pose}
                lookX={ch.lookX}
                lookY={ch.lookY}
                tilt={ch.tilt}
                blur={ch.blur}
                opacity={ch.opacity}
                phase={i * 11}
              />
            ))}
          </svg>
        </CameraMovement>
      )}
      {c && (
        <CameraMovement cam={cam} depth={0.2} origin={[W / 2, 760]}>
          {c.type === "face" && (
            <>
              {c.behind && <BlurBust who={c.behind.who} x={c.behind.x} y={c.behind.y} scale={c.behind.scale} expr={c.behind.expr} frame={frame} />}
              <FaceCloseup who={c.who} frame={frame} t={t} expr={c.expr} lookX={lerp(c.lookX ?? 0, c.lookToX ?? c.lookX ?? 0, e)} lookY={lerp(c.lookY ?? 0, c.lookToY ?? c.lookY ?? 0, e)} tilt={c.tilt} crop={c.crop} side={c.side} />
            </>
          )}
          {c.type === "pair" && <Pair def={c} t={t} frame={frame} />}
          {c.type === "palm" && <PalmCloseup frame={frame} t={t} girlHand={c.girlHand} girlProg={c.girlHand ? Math.min(1, t * 1.3) : 0} />}
          {c.type === "mehendi" && <MehendiHands frame={frame} t={t} />}
          {c.type === "hands" && <HandsTogether frame={frame} t={t} prog={lerp(c.prog[0], c.prog[1], e)} mehendi={c.mehendi ?? true} />}
          {c.type === "anklet" && <AnkletCloseup frame={frame} t={t} />}
        </CameraMovement>
      )}
      {(def.petals ?? 0) > 0 && <Petals frame={frame} count={def.petals} seed={def.seed ?? 3} />}
      {(def.dust ?? 0) > 0 && <Dust frame={frame} count={def.dust} seed={(def.seed ?? 5) + 1} />}
      {(def.butterflies ?? 0) > 0 && <Butterflies frame={frame} count={def.butterflies} />}
      {(def.flare ?? 0) > 0 && <LensFlare frame={frame} strength={def.flare} />}
      {def.memory && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 42%, rgba(255,245,233,0) 40%, rgba(255,245,233,0.6) 100%)" }} />}
    </div>
  );
};
