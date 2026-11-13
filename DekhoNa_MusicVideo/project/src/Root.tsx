import React from "react";
import { AbsoluteFill, Composition, Sequence, useCurrentFrame, staticFile } from "remotion";
import { W, H, FPS, clamp, easeInOut } from "./theme";
import sceneTiming from "./data/scene_timing.json";
import { SCENES } from "./scenes/sceneDefs";
import { Scene } from "./components/Scene";
import { LyricText } from "./components/LyricText";
import { TitleCard } from "./components/TitleCard";
import { FilmLook } from "./components/ParticleEffects";
import { SongAudio, beatPulse } from "./components/AudioSync";
import { fontCss } from "./fonts";
import { CharacterSheet, BackgroundPlate, IllustrationPlate, LyricOnly } from "./CharacterSheet";

type SceneT = { scene_id: string; start_frame: number; end_frame: number };
const SCENE_LIST = sceneTiming.scenes as SceneT[];
const TOTAL = sceneTiming.duration_frames;



const SceneSeq: React.FC<{ s: SceneT; idx: number }> = ({ s, idx }) => {
  const lf = useCurrentFrame();
  const def = SCENES[s.scene_id];
  if (!def) throw new Error(`No scene definition for ${s.scene_id}`);
  const ovl = idx === 0 ? 0 : def.trans === "cut" ? 0 : def.transFrames ?? 14;
  const dur = s.end_frame - s.start_frame;
  const t = clamp((lf - ovl) / dur);
  const gf = s.start_frame - ovl + lf; // global frame
  const p = ovl ? clamp(lf / ovl) : 1;
  let style: React.CSSProperties = { opacity: easeInOut(p) };
  let overlay: React.ReactNode = null;
  if (def.trans === "wipe" && ovl) {
    const x = p * 140 - 20;
    style = { opacity: 1, WebkitMaskImage: `linear-gradient(100deg, #000 ${x - 20}%, transparent ${x}%)`, maskImage: `linear-gradient(100deg, #000 ${x - 20}%, transparent ${x}%)` };
  }
  if (def.trans === "match" && ovl) style = { opacity: easeInOut(p), transform: `scale(${1.07 - 0.07 * easeInOut(p)})`, transformOrigin: "50% 40%" };
  if (def.trans === "light" && ovl) {
    overlay = <div style={{ position: "absolute", inset: 0, background: "#FFE9C8", opacity: Math.sin(p * Math.PI) * 0.7, mixBlendMode: "screen" }} />;
  }
  return (
    <AbsoluteFill style={style}>
      <Scene def={def} lf={lf} t={t} frame={gf} />
      {overlay}
    </AbsoluteFill>
  );
};

const DekhoNa: React.FC = () => {
  const frame = useCurrentFrame();
  // opening title 3.2s–13s, closing title from outro
  const outro = SCENE_LIST.find((s) => s.scene_id === "outro")!;
  const t0 = Math.round(3.2 * FPS), t1 = Math.round(11.5 * FPS);
  const openO = clamp((frame - t0) / 36) * clamp((t1 + 40 - frame) / 40);
  const openP = clamp((frame - t0) / 60);
  const closeO = clamp((frame - outro.start_frame - 10) / 50);
  const closeP = clamp((frame - outro.start_frame - 10) / 70);
  return (
    <AbsoluteFill style={{ background: "#FFF5E9" }}>
      <style>{fontCss}</style>
      <SongAudio />
      {SCENE_LIST.map((s, i) => {
        const def = SCENES[s.scene_id];
        const ovl = i === 0 || def?.trans === "cut" ? 0 : def?.transFrames ?? 14;
        const from = Math.max(0, s.start_frame - ovl);
        return (
          <Sequence key={s.scene_id} from={from} durationInFrames={s.end_frame - from} layout="none">
            <SceneSeq s={s} idx={i} />
          </Sequence>
        );
      })}
      <FilmLook frame={frame} beatPulse={beatPulse(frame)} />
      {openO > 0 && <TitleCard p={openP} o={openO} top={330} />}
      {closeO > 0 && <TitleCard p={closeP} o={closeO} top={520} />}
      <LyricText frame={frame} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DekhoNa" component={DekhoNa} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    {/* asset-export stills (character reference sheets, background plates) */}
    <Composition id="SheetBoy" component={CharacterSheet} defaultProps={{ who: "boy" as const }} durationInFrames={1} fps={FPS} width={2000} height={1100} />
    <Composition id="SheetGirl" component={CharacterSheet} defaultProps={{ who: "girl" as const }} durationInFrames={1} fps={FPS} width={2000} height={1100} />
    <Composition id="Illus" component={IllustrationPlate} defaultProps={{ kind: "flowers" as const }} durationInFrames={1} fps={FPS} width={1600} height={1200} />\n    <Composition id="LyricOnly" component={LyricOnly} defaultProps={{ frame: 800 }} durationInFrames={1} fps={FPS} width={W} height={H} />\n    <Composition id="BgPlate" component={BackgroundPlate} defaultProps={{ kind: "garden" as const }} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);


