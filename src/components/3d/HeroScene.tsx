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
}: {
  frameloop?: "always" | "never" | "demand";
}) {
  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.6, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 4]} intensity={1.6} color="#eafff5" />
      <pointLight position={[-4, -1, 3]} intensity={2.2} decay={0} color="#10b981" />
      <pointLight position={[4, 3, -3]} intensity={1.6} decay={0} color="#22d3ee" />

      <SmartBinModel />

      <Sparkles count={48} scale={[8, 6, 4]} size={2.2} speed={0.3} color="#34d399" opacity={0.5} />
    </Canvas>
  );
}
