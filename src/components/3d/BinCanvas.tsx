"use client";

import { memo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh, MeshStandardMaterial } from "three";
import { SmartBinModel } from "./SmartBinModel";

export type BinStatus = "active" | "full" | "offline" | "maintenance";
export type BinData = { fill: number; status: BinStatus };

const STATUS_HEX: Record<BinStatus, string> = {
  active: "#34d399",
  full: "#fbbf24",
  offline: "#5b6b85",
  maintenance: "#60a5fa",
};

function fillHex(fill: number) {
  return fill >= 95 ? "#f87171" : fill >= 75 ? "#fbbf24" : "#34d399";
}

/**
 * Reads live telemetry from `dataRef` every frame and lerps the fill gauge +
 * status halo toward it. Nothing here is React state, so data updates never
 * trigger a re-render — the scene mutates Three objects directly.
 */
function Scene({ dataRef, lite = false }: { dataRef: RefObject<BinData>; lite?: boolean }) {
  const fill = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const d = dataRef.current;
    if (fill.current) {
      const target = Math.max(0.02, Math.min(1, d.fill / 100));
      const s = fill.current.scale;
      s.y += (target - s.y) * Math.min(1, delta * 4);
      fill.current.position.y = -0.95 + 0.95 * s.y;
      const mat = fill.current.material as MeshStandardMaterial;
      const hex = fillHex(d.fill);
      mat.color.set(hex);
      mat.emissive.set(hex);
    }
    if (halo.current) {
      const mat = halo.current.material as MeshStandardMaterial;
      const hex = STATUS_HEX[d.status];
      mat.color.set(hex);
      mat.emissive.set(hex);
    }
  });

  return (
    <>
      <SmartBinModel lite={lite} />

      {/* status halo behind the bin */}
      <mesh ref={halo} position={[0, 0, -1.2]}>
        <torusGeometry args={[1.5, 0.04, lite ? 8 : 16, lite ? 24 : 48]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>

      {/* fill gauge to the side */}
      <group position={[2.1, -0.1, 0]}>
        <mesh>
          <boxGeometry args={[0.18, 1.9, 0.18]} />
          <meshStandardMaterial color="#0e1626" metalness={0.5} roughness={0.6} transparent opacity={0.55} />
        </mesh>
        <mesh ref={fill} position={[0, -0.93, 0]} scale={[1, 0.02, 1]}>
          <boxGeometry args={[0.16, 1.9, 0.16]} />
          <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

function BinCanvas({
  dataRef,
  inView,
  quality = "full",
}: {
  dataRef: RefObject<BinData>;
  inView: boolean;
  quality?: "full" | "lite";
}) {
  const lite = quality === "lite";
  return (
    <Canvas
      frameloop={inView ? "always" : "never"}
      // Capped DPR + no antialias on mobile — keeps fill/rate at 60fps on phones.
      dpr={lite ? [1, 1.5] : [1, 2]}
      camera={{ position: [0.7, 0.3, 6.8], fov: 42 }}
      gl={{ antialias: !lite, alpha: true, powerPreference: "high-performance" }}
      // pan-y preserves vertical page scroll over the card; horizontal drag rotates.
      style={{ background: "transparent", touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 4]} intensity={1.5} color="#eafff5" />
      <pointLight position={[-4, -1, 3]} intensity={2} decay={0} color="#10b981" />
      <pointLight position={[4, 3, -3]} intensity={1.4} decay={0} color="#22d3ee" />
      <Scene dataRef={dataRef} lite={lite} />
    </Canvas>
  );
}

// Memoized so the dashboard's 5s polling (which updates refs + sibling state)
// never re-renders the WebGL canvas — props stay referentially stable.
export default memo(BinCanvas);
