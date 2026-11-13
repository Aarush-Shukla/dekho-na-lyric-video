import React from "react";
import { C, FONT_DEVA, clamp, easeOut } from "../theme";
import meta from "../data/title.json";

/** Opening / closing title. `p` = 0..1 reveal progress, `o` = overall opacity. */
export const TitleCard: React.FC<{ p: number; o: number; top?: number }> = ({ p, o, top = 380 }) => {
  const e = easeOut(p);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: o, transform: `translateY(${(1 - e) * 24}px)` }}>
      <div style={{ fontFamily: FONT_DEVA, fontWeight: 500, fontSize: 190, lineHeight: 1.4, color: C.brown, textShadow: "0 0 36px rgba(255,245,233,0.95), 0 0 12px rgba(255,245,233,0.8)", opacity: clamp(e * 1.4) }}>{meta.title_devanagari}</div>
      <div style={{ fontFamily: FONT_DEVA, fontWeight: 500, fontSize: 64, letterSpacing: "0.32em", color: C.brown, textShadow: "0 0 22px rgba(255,245,233,0.95)", marginTop: 4, opacity: clamp(e * 1.6 - 0.3) }}>{meta.title.toUpperCase()}</div>
      <div style={{ width: 160, height: 3, background: C.brown, margin: "34px auto 28px", opacity: clamp(e * 2 - 0.8) * 0.8, transform: `scaleX(${clamp(e * 2 - 0.8)})` }} />
      <div style={{ fontFamily: FONT_DEVA, fontWeight: 500, fontSize: 46, letterSpacing: "0.28em", color: C.brown, textShadow: "0 0 18px rgba(255,245,233,0.95)", opacity: clamp(e * 2 - 1) }}>{meta.artist.toUpperCase()}</div>
    </div>
  );
};
