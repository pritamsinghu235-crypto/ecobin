"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { SmartBinModel } from "./SmartBinModel";

/**
 * The R3F canvas for the landing hero. Transparent background so it layers
 * over the page's gradient mesh. `frameloop` is toggled to "never" when the
 * hero scrolls offscreen to save GPU. Lighting is local-only (no external
 * HDR/environment) so no network assets and no CSP changes are needed.
 */
export default function HeroScene({
  frameloop = "always",
  quality = "full",
}: {
  frameloop?: "always" | "never" | "demand";
  quality?: "full" | "lite";
}) {
  const lite = quality === "lite";
  return (
    <Canvas
      frameloop={frameloop}
      // Cap DPR hard on mobile — high-DPR phones (2–3x) otherwise render 4–9x
      // the pixels, the #1 mobile WebGL bottleneck. Drop antialias too (the
      // capped DPR already smooths edges well enough at phone sizes).
      dpr={lite ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0.6, 6], fov: 42 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
      // pan-y keeps vertical page scroll working when a finger starts on the
      // canvas; horizontal drags still reach the model for rotation.
      style={{ background: "transparent", touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 4]} intensity={1.6} color="#eafff5" />
      <pointLight position={[-4, -1, 3]} intensity={2.2} decay={0} color="#10b981" />
      <pointLight position={[4, 3, -3]} intensity={1.6} decay={0} color="#22d3ee" />

      {/* slightly smaller floating bin on mobile */}
      <group scale={lite ? 0.82 : 1}>
        <SmartBinModel lite={lite} />
      </group>

      <Sparkles
        count={lite ? 16 : 48}
        scale={lite ? [6, 5, 3] : [8, 6, 4]}
        size={2.2}
        speed={0.3}
        color="#34d399"
        opacity={0.5}
      />
    </Canvas>
  );
}
