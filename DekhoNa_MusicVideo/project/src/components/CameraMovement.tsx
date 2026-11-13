import React from "react";
import { W, H, lerp, easeInOut } from "../theme";

export type CamSpec = { z?: [number, number]; x?: [number, number]; y?: [number, number] };

export const camAt = (spec: CamSpec | undefined, t: number) => {
  const e = easeInOut(t);
  const s = spec ?? {};
  return {
    z: lerp(s.z?.[0] ?? 1.0, s.z?.[1] ?? 1.06, e),
    x: lerp(s.x?.[0] ?? 0, s.x?.[1] ?? 0, e),
    y: lerp(s.y?.[0] ?? 0, s.y?.[1] ?? 0, e),
  };
};

/** Applies a push-in / pull-out / pan to its children (used for characters and close-ups). */
export const CameraMovement: React.FC<{ cam: { x: number; y: number; z: number }; depth?: number; origin?: [number, number]; children: React.ReactNode }> = ({ cam, depth = 0.6, origin = [W / 2, H * 0.72], children }) => (
  <div style={{ position: "absolute", inset: 0, transformOrigin: `${origin[0]}px ${origin[1]}px`, transform: `translate(${-cam.x * depth}px, ${-cam.y * depth}px) scale(${cam.z})` }}>{children}</div>
);
